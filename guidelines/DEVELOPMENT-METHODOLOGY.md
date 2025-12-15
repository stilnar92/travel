# Development Methodology

## Software Development Sequence

When building a real software solution for a business problem, follow this sequence:

```
1. Business Processes
   └──► 2. Business Requirements (with economic justification)
           └──► 3. Functional Design:
                   - Scenarios
                   - Scenario Operations
                   └──► 4. Technical Design:
                           - Components and Functional Boundaries
                           - Technologies
                           - API
                           - UI
                           - Database
                           - Software Architecture
                           - CI/CD
```

---

## Problem Space vs Solution Space

| Space | Steps | Responsibility |
|-------|-------|----------------|
| **Problem Space** | 1. Business Processes | Business Analysts, Product |
| | 2. Business Requirements | Business Analysts, Product |
| **Solution Space** | 3. Functional Design | IT Engineers |
| | 4. Technical Design | IT Engineers |

---

## Step Details

### 1. Business Processes
- How the business operates today
- Pain points and inefficiencies
- Stakeholders and their roles
- Current workflows

### 2. Business Requirements
- What the business needs to achieve
- Success metrics and KPIs
- Constraints and assumptions

### 3. Functional Design
- **Scenarios**: User stories and use cases
- **Scenario Operations**: Step-by-step actions within each scenario
- UI/UX wireframes and flows
- Data requirements

### 4. Technical Design
- **Components**: Modules, services, boundaries
- **Technologies**: Stack decisions with rationale
- **API**: Endpoints, contracts, authentication
- **UI**: Component architecture, state management
- **Database**: Schema, relationships, indexes
- **Architecture**: Patterns, layers, deployment
- **CI/CD**: Build, test, deploy pipelines

---


## Key Principle

> **Never jump to Solution Space (steps 3-4) without clarity in Problem Space (steps 1-2).**

Understanding the business problem ensures the technical solution actually solves it.
