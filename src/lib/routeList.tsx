enum TrashQueries {
  TRASH = "trash",
}

export const routeList = {
  TEMPLATE_CENTER: {
    path: "/template-center",
    childPaths: {
      notificationTemplates: {
        path: "/notification-template",
        childPaths: {
          create: {
            path: "/create",
          },
          edit: {
            path: "/edit",
          },
        },
      },
      questionnaire: {
        path: "/questionnaire",
        childPaths: {
          create: {
            path: "/create",
          },
          edit: {
            path: "/edit",
          },
        },
        queries: TrashQueries,
      },
      termsAndConditions: {
        path: "/terms-and-condition",
      },
      proposal: {
        path: "/proposal",
        childPaths: {
          create: {
            path: "/create",
          },
          edit: {
            path: "/edit",
          },
        },
        queries: TrashQueries,
      },
    },
  },
  BOQ: {
    path: "/boq",
    childPaths: {
      library: {
        path: "/library",
        childPaths: {
          create: {
            path: "/create",
          },
          edit: {
            path: "/edit",
          },
        },
      },
      myItem: {
        path: "/my-item",
        childPaths: {
          create: {
            path: "/create",
          },
          edit: {
            path: "/edit",
          },
        },
      },
    },
  },
  LOCALIZATION: {
    path: "/localization",
    childPaths: {
      taxes: {
        path: "/taxes",
        childPaths: {
          create: {
            path: "/create",
          },
          edit: {
            path: "/edit",
          },
        },
      },
    },
  },
  PREFERENCES: {
    path: "/preferences",
    childPaths: {
      leadCapture: {
        path: "/lead-capture",
        childPaths: {
          // create: {
          //     path:'/create'
          // },
          edit: {
            path: "/edit",
          },
        },
        queries: TrashQueries,
      },
    },
  },
};
