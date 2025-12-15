/**
 * Application routes configuration
 * All routes should be defined here to avoid hardcoded strings
 */

export const routes = {
  home: "/",

  vendors: {
    list: "/vendors",
    new: "/vendors/new",
    edit: (id: string) => `/vendors/${id}/edit`,
    view: (id: string) => `/vendors/${id}`,
  },

  categories: {
    list: "/categories",
  },
} as const;
