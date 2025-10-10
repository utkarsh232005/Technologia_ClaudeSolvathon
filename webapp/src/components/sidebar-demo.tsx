"use client";
import React, { useState } from "react";
import { AnimatedSidebar, AnimatedSidebarBody, AnimatedSidebarLink } from "@/components/ui/animated-sidebar";
import {
    IconAtom,
    IconChartBar,
    IconFileSpreadsheet,
    IconSettings,
    IconHelp,
    IconReportAnalytics,
    IconDatabase,
    IconHome,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function DarkMatterSidebarDemo() {
    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: (
                <IconHome className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
        {
            label: "Event Classifier",
            href: "/classifier",
            icon: (
                <IconAtom className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
        {
            label: "Data Generator",
            href: "/generator",
            icon: (
                <IconDatabase className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
        {
            label: "Results Dashboard",
            href: "/results",
            icon: (
                <IconChartBar className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
        {
            label: "Report Generator",
            href: "/reports",
            icon: (
                <IconReportAnalytics className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
        {
            label: "Help",
            href: "/help",
            icon: (
                <IconHelp className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
        {
            label: "Settings",
            href: "/settings",
            icon: (
                <IconSettings className="h-5 w-5 shrink-0 text-white dark:text-white" />
            ),
        },
    ];
    const [open, setOpen] = useState(false);
    return (
        <div
            className={cn(
                "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-700 bg-black md:flex-row dark:border-neutral-700 dark:bg-black",
                "h-screen", // Full height for the dark matter app
            )}
        >
            <AnimatedSidebar open={open} setOpen={setOpen}>
                <AnimatedSidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <DarkMatterLogo /> : <DarkMatterLogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <AnimatedSidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <AnimatedSidebarLink
                            link={{
                                label: "IIIT Team",
                                href: "#",
                                icon: (
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                        DM
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </AnimatedSidebarBody>
            </AnimatedSidebar>
            <DarkMatterDashboard />
        </div>
    );
}

export const DarkMatterLogo = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
        >
            <div className="h-5 w-6 shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <IconAtom className="h-3 w-3 text-white" />
            </div>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-white dark:text-white"
            >
                Dark Matter Lab
            </motion.span>
        </a>
    );
};

export const DarkMatterLogoIcon = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-white"
        >
            <div className="h-5 w-6 shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <IconAtom className="h-3 w-3 text-white" />
            </div>
        </a>
    );
};

// Dashboard content for the dark matter app
const DarkMatterDashboard = () => {
    return (
        <div className="flex flex-1">
            <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dark Matter Detection Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Advanced AI-powered particle event classification system
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { title: "Events Classified", value: "1,247", color: "from-blue-500 to-blue-600" },
                        { title: "WIMP Candidates", value: "23", color: "from-purple-500 to-purple-600" },
                        { title: "Background Events", value: "1,198", color: "from-green-500 to-green-600" },
                        { title: "Anomalies Found", value: "3", color: "from-red-500 to-red-600" },
                    ].map((stat, idx) => (
                        <div
                            key={"stat-" + idx}
                            className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
                        >
                            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r ${stat.color} mb-3`}>
                                <IconAtom className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-1 gap-4">
                    <div className="flex-1 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Classifications
                        </h3>
                        <div className="space-y-3">
                            {[
                                { id: "EVT-001", type: "WIMP-like (NR)", confidence: "0.87", time: "2 min ago" },
                                { id: "EVT-002", type: "Background (ER)", confidence: "0.94", time: "5 min ago" },
                                { id: "EVT-003", type: "Novel Anomaly", confidence: "0.72", time: "8 min ago" },
                            ].map((event, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-neutral-700">
                                    <div className="flex items-center space-x-3">
                                        <IconAtom className="h-4 w-4 text-blue-500" />
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">{event.id}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{event.type}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-gray-900 dark:text-white">{event.confidence}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">{event.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            System Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Claude API</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Backend Server</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Running
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Data Pipeline</span>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
