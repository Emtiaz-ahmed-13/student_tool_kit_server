import app from "./app";

// This is a simple test to verify routes are registered correctly
const testRoutes = () => {
  // @ts-ignore
  const routes = app._router.stack
    .filter((r: any) => r.route)
    .map((r: any) => {
      return {
        path: r.route.path,
        methods: Object.keys(r.route.methods),
      };
    });

  console.log("Registered routes:");
  routes.forEach((route: any) => {
    console.log(
      `  ${Object.keys(route.methods)[0].toUpperCase()} ${route.path}`
    );
  });
};

export default testRoutes;
