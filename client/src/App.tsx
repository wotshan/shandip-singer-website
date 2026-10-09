import { Switch, Route } from "wouter";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import { OccasionsPage } from "./pages/About";
import Events from "./pages/Events";
import Music from "./pages/Music";
import Gallery from "./pages/Gallery";
import Availability from "./pages/Availability";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

/**
 * Route table. Every navigation target in the app must have a route entry here —
 * the catch-all stays last so nothing below it is unreachable.
 *
 * There is no signup route: the site has exactly one admin, created server-side.
 */
export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/events" component={Events} />
        <Route path="/music" component={Music} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/occasions" component={OccasionsPage} />
        <Route path="/availability" component={Availability} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}
