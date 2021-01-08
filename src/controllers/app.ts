import { Request, Response } from "express";

/**
 * Home page.
 * @route GET /
 */
export const index = (req: Request, res: Response) => {
    res.render("home", {
        title: "Home"
    });
};

/**
 * Admin Dashboard page.
 * @route GET /
 */
export const adminDashboard = (req: Request, res: Response) => {
    // TBD: change to admin dashboard page
    res.render("home", {
        title: "Dashboard"
    });
};
