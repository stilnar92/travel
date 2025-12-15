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
    // TODO: Implement vendor detail page
    view: (id: string) => `/vendors/${id}`,
  },

  categories: {
    list: "/categories",
  },

  auth: {
    login: "/login",
  },
} as const;
