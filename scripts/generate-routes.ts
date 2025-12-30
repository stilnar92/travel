/**
 * Route Generator Script
 *
 * Scans src/app/ directory for page.tsx files and generates type-safe route builders.
 * Extracts searchParams types from page component props.
 *
 * Usage: npx tsx scripts/generate-routes.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'

const APP_DIR = path.join(process.cwd(), 'src', 'app')
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'shared', 'lib', 'routes', 'generated.ts')

interface RouteInfo {
  path: string
  segments: string[]
  searchParamsType: string | null
  externalTypes: string[] // Types that need to be imported
}

interface RouteNode {
  [key: string]: RouteNode | RouteInfo
}

// Map of type name -> import path
const typeImports: Map<string, string> = new Map()

// Check if segment is a route group (parentheses like (protected), (public))
function isRouteGroup(segment: string): boolean {
  return segment.startsWith('(') && segment.endsWith(')')
}

// Find all page.tsx files
function findPageFiles(dir: string, basePath: string = ''): RouteInfo[] {
  const routes: RouteInfo[] = []

  if (!fs.existsSync(dir)) {
    return routes
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip special Next.js directories
      if (entry.name.startsWith('_') || entry.name === 'api') {
        continue
      }

      // Route groups (like (protected)) don't appear in URL path
      const newBasePath = isRouteGroup(entry.name) ? basePath : basePath + '/' + entry.name
      routes.push(...findPageFiles(fullPath, newBasePath))
    } else if (entry.name === 'page.tsx') {
      const routePath = basePath || '/'
      const { type: searchParamsType, externalTypes } = extractSearchParamsType(fullPath)

      routes.push({
        path: routePath,
        segments: routePath.split('/').filter(Boolean),
        searchParamsType,
        externalTypes,
      })
    }
  }

  return routes
}

// Extract imports from a source file
function extractImports(sourceFile: ts.SourceFile): Map<string, string> {
  const imports = new Map<string, string>()

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && statement.moduleSpecifier) {
      const modulePath = (statement.moduleSpecifier as ts.StringLiteral).text
      const importClause = statement.importClause

      if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
        for (const element of importClause.namedBindings.elements) {
          const typeName = element.name.text
          imports.set(typeName, modulePath)
        }
      }
    }
  }

  return imports
}

// Find external type references in a type node
function findExternalTypes(typeNode: ts.TypeNode, fileImports: Map<string, string>): string[] {
  const externalTypes: string[] = []

  function visit(node: ts.Node) {
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
      const typeName = node.typeName.text
      // Check if this type is imported (not a built-in type)
      if (fileImports.has(typeName)) {
        externalTypes.push(typeName)
        // Store in global map for later import generation
        typeImports.set(typeName, fileImports.get(typeName)!)
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(typeNode)
  return externalTypes
}

// Extract param names from searchParams.get('paramName') calls in client components
function extractClientSearchParams(sourceFile: ts.SourceFile): string[] {
  const params = new Set<string>()

  function visit(node: ts.Node) {
    // Look for searchParams.get('paramName') calls
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'get' &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'searchParams' &&
      node.arguments.length === 1 &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      params.add(node.arguments[0].text)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return Array.from(params).sort()
}

// Extract searchParams type from page component using TypeScript compiler
function extractSearchParamsType(filePath: string): {
  type: string | null
  externalTypes: string[]
} {
  const content = fs.readFileSync(filePath, 'utf-8')

  // Quick check if file has searchParams
  if (!content.includes('searchParams')) {
    return { type: null, externalTypes: [] }
  }

  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true)

  // Extract imports from this file
  const fileImports = extractImports(sourceFile)

  let searchParamsType: string | null = null
  let externalTypes: string[] = []

  // Check if this is a client component
  const isClientComponent = content.includes("'use client'") || content.includes('"use client"')

  if (isClientComponent) {
    // For client components, extract params from searchParams.get('paramName') calls
    const params = extractClientSearchParams(sourceFile)
    if (params.length > 0) {
      searchParamsType = '{' + params.map((p) => `${p}: string`).join('; ') + '}'
    }
  } else {
    // For server components, look at function props
    const visit = (node: ts.Node) => {
      // Look for default export function
      if (
        ts.isFunctionDeclaration(node) &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
        node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)
      ) {
        const param = node.parameters[0]
        if (param && param.type && ts.isTypeLiteralNode(param.type)) {
          // Find searchParams property
          for (const member of param.type.members) {
            if (
              ts.isPropertySignature(member) &&
              member.name &&
              ts.isIdentifier(member.name) &&
              member.name.text === 'searchParams' &&
              member.type
            ) {
              searchParamsType = extractTypeString(member.type, content)
              externalTypes = findExternalTypes(member.type, fileImports)
            }
          }
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
  }

  return { type: searchParamsType, externalTypes }
}

// Extract type as string from TypeScript AST node
function extractTypeString(typeNode: ts.TypeNode, sourceContent: string): string {
  const start = typeNode.getStart()
  const end = typeNode.getEnd()
  return sourceContent.substring(start, end)
}

// Convert kebab-case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

// Check if segment is dynamic [param]
function isDynamicSegment(segment: string): boolean {
  return segment.startsWith('[') && segment.endsWith(']')
}

// Extract param name from [param]
function getParamName(segment: string): string {
  return segment.slice(1, -1)
}

// Build route tree from flat routes
function buildRouteTree(routes: RouteInfo[]): RouteNode {
  const tree: RouteNode = {}

  for (const route of routes) {
    let current = tree
    const segments = route.segments

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!
      const isLast = i === segments.length - 1
      const key = isDynamicSegment(segment) ? `$${getParamName(segment)}` : toCamelCase(segment)

      if (isLast) {
        // This is the final segment - it's a page
        if (!current[key]) {
          current[key] = {}
        }

        // Store route info at $root if there are nested routes, otherwise at key
        const hasNestedRoutes = routes.some(
          (r) =>
            r.path !== route.path &&
            r.path.startsWith(route.path + '/') &&
            !r.segments[segments.length]?.startsWith('[')
        )

        if (hasNestedRoutes) {
          ;(current[key] as RouteNode).$root = route
        } else {
          // Check if there are already nested keys
          const existingKeys = Object.keys(current[key] as RouteNode)
          if (existingKeys.length > 0) {
            ;(current[key] as RouteNode).$root = route
          } else {
            current[key] = route
          }
        }
      } else {
        if (!current[key]) {
          current[key] = {}
        }
        current = current[key] as RouteNode
      }
    }
  }

  // Handle root route (/) if exists
  const rootRoute = routes.find((r) => r.path === '/')
  if (rootRoute) {
    tree.$root = rootRoute
  }

  return tree
}

// Check if value is RouteInfo
function isRouteInfo(value: unknown): value is RouteInfo {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    'segments' in value &&
    typeof (value as RouteInfo).path === 'string'
  )
}

// Generate route builder code
function generateRouteCode(
  tree: RouteNode,
  indent: number = 2,
  parentPath: string = '',
  dynamicParams: string[] = []
): string {
  const spaces = ' '.repeat(indent)
  const lines: string[] = []

  const sortedKeys = Object.keys(tree).sort((a, b) => {
    // $root first, then $dynamic, then alphabetically
    if (a === '$root') return -1
    if (b === '$root') return 1
    if (a.startsWith('$') && !b.startsWith('$')) return 1
    if (!a.startsWith('$') && b.startsWith('$')) return -1
    return a.localeCompare(b)
  })

  for (const key of sortedKeys) {
    const value = tree[key]

    if (isRouteInfo(value)) {
      // This is a route endpoint
      const routePath = value.path
      const hasSearchParams = value.searchParamsType !== null

      // Build path with dynamic params
      let pathExpr = `'${routePath}'`
      if (dynamicParams.length > 0) {
        pathExpr = '`' + routePath.replace(/\[([^\]]+)\]/g, (_, param) => '${' + param + '}') + '`'
      }

      if (hasSearchParams) {
        // Make all searchParams optional
        const optionalType = makeTypeOptional(value.searchParamsType!)
        lines.push(
          `${spaces}${key}: (params?: ${optionalType}) => ${pathExpr} + buildQueryString(params),`
        )
      } else {
        lines.push(`${spaces}${key}: () => ${pathExpr},`)
      }
    } else if (key.startsWith('$') && key !== '$root') {
      // Dynamic segment - create a function that returns nested object
      const paramName = key.slice(1)
      const newDynamicParams = [...dynamicParams, paramName]
      const nested = generateRouteCode(
        value as RouteNode,
        indent + 2,
        `${parentPath}/[${paramName}]`,
        newDynamicParams
      )

      lines.push(`${spaces}${key}: (${paramName}: string) => ({`)
      lines.push(nested)
      lines.push(`${spaces}}),`)
    } else {
      // Regular nested object
      const nested = generateRouteCode(
        value as RouteNode,
        indent + 2,
        `${parentPath}/${key}`,
        dynamicParams
      )
      lines.push(`${spaces}${key}: {`)
      lines.push(nested)
      lines.push(`${spaces}},`)
    }
  }

  return lines.join('\n')
}

// Make all properties in type optional
function makeTypeOptional(typeStr: string): string {
  // Simple transformation: add ? to all properties
  // {type: 'send' | 'receive'; asset: string} -> {type?: 'send' | 'receive'; asset?: string}
  return typeStr.replace(/(\w+):/g, '$1?:').replace(/(\w+)\?+:/g, '$1?:') // Avoid double ??
}

// Generate import statements from collected types
function generateImports(): string {
  if (typeImports.size === 0) return ''

  // Group types by their import path
  const importsByPath = new Map<string, string[]>()

  Array.from(typeImports.entries()).forEach(([typeName, importPath]) => {
    if (!importsByPath.has(importPath)) {
      importsByPath.set(importPath, [])
    }
    importsByPath.get(importPath)!.push(typeName)
  })

  // Generate import statements
  const imports: string[] = []
  Array.from(importsByPath.entries()).forEach(([importPath, types]) => {
    const sortedTypes = types.sort()
    imports.push(`import type {${sortedTypes.join(', ')}} from '${importPath}'`)
  })

  return imports.join('\n') + '\n\n'
}

// Generate the full output file
function generateOutputFile(routes: RouteInfo[]): string {
  const tree = buildRouteTree(routes)
  const routeCode = generateRouteCode(tree)
  const imports = generateImports()

  return `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 *
 * Generated by: scripts/generate-routes.ts
 * Run: pnpm generate:routes
 */

${imports}// Query string builder utility
export function buildQueryString<T extends Record<string, string | number | boolean | undefined>>(
  params?: T
): string {
  if (!params) return ''

  const entries = Object.entries(params).filter(
    ([_, value]) => value !== undefined && value !== ''
  )

  if (entries.length === 0) return ''

  const queryString = entries
    .map(([key, value]) => \`\${encodeURIComponent(key)}=\${encodeURIComponent(String(value))}\`)
    .join('&')

  return \`?\${queryString}\`
}

// Type-safe route builders
export const routes = {
${routeCode}
} as const

// Export type for external usage
export type Routes = typeof routes
`
}

// Main execution
function main() {
  console.log('Scanning app directory for routes...')

  const routes = findPageFiles(APP_DIR)

  console.log(`Found ${routes.length} routes`)

  // Sort routes for consistent output
  routes.sort((a, b) => a.path.localeCompare(b.path))

  // Log routes with searchParams
  const routesWithParams = routes.filter((r) => r.searchParamsType)
  if (routesWithParams.length > 0) {
    console.log(`\nRoutes with searchParams (${routesWithParams.length}):`)
    for (const route of routesWithParams) {
      console.log(`  ${route.path}`)
    }
  }

  const output = generateOutputFile(routes)

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8')

  console.log(`\nGenerated: ${OUTPUT_FILE}`)
}

main()
