// Client-side API routes configuration
export const apiRoutes = {
  auth: {
    user: "/api/auth/user",
    login: "/api/auth/login",
    signup: "/api/auth/signup",
    logout: "/api/auth/logout",
    verifyEmail: "/api/auth/verify-email",
  },
  members: {
    me: "/api/members/me",
    search: "/api/members/search",
    updateHouseCell: (id: string) => `/api/members/${id}/house-cell`,
  },
  admin: {
    users: "/api/admin/users",
    getUser: (id: number) => `/api/admin/users/${id}`,
  },
  events: {
    list: "/api/events",
    get: (id: number) => `/api/events/${id}`,
    create: "/api/events",
    rsvp: (id: number) => `/api/events/${id}/rsvp`,
    rsvps: "/api/events/rsvps",
    addToCalendar: (id: number) => `/api/events/${id}/calendar`,
    withRsvps: (id: number) => `/api/events/${id}/with-rsvps`,
  },
  sermons: {
    list: "/api/sermons",
    get: (id: number) => `/api/sermons/${id}`,
    create: "/api/sermons",
    share: (id: number) => `/api/sermons/${id}/share`,
    download: (id: number) => `/api/sermons/${id}/download`,
  },
  prayer: {
    list: "/api/prayer-requests",
    create: "/api/prayer-requests",
    pray: (id: number) => `/api/prayer-requests/${id}/pray`,
  },
  donations: {
    create: "/api/donations",
    statement: (year: number) => `/api/donations/statement/${year}`,
    history: (year?: number) => year ? `/api/donations/history?year=${year}` : `/api/donations/history`,
  },
  uploads: {
    requestUrl: "/api/uploads/request-url",
  },
} as const;