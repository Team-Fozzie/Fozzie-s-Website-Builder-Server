page("/", () => app.loginView.initLoginView());
page("/sign-up", () => app.homeView.initHomeView());
page("/create/:project_id/:project_name", ctx => app.createView.initCreateView(ctx));
page("/create/new/:user_id", (ctx) => app.createView.initCreateView(ctx));
page("/projects/:user_id", ctx => app.projectView.initProjectView(ctx));
page("/about-us", app.aboutUsView.initAboutUs);

page();