"use client";

import { BarChart3, TrendingUp, Users, Calendar, Activity, Zap, Target, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function AnalyticsPage() {
  const stats = [
    {
      title: "Total Events",
      value: "--",
      icon: Calendar,
      iconColor: "text-blue-400",
    },
    {
      title: "Total Participants",
      value: "--",
      icon: Users,
      iconColor: "text-purple-400",
    },
    {
      title: "Engagement Rate",
      value: "--",
      icon: TrendingUp,
      iconColor: "text-emerald-400",
    },
    {
      title: "Active Now",
      value: "--",
      icon: Activity,
      iconColor: "text-orange-400",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  

  return (
    <div className="h-max bg-gray-900 w-full text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/50 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-700/40 p-8 space-y-6"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <BarChart3 className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
            </div>
            <p className="text-gray-400 text-sm">Monitor your event performance in real-time</p>
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gray-700/20" />

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="group bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/30 hover:border-gray-600/50 rounded-2xl p-5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-300">{stat.title}</h3>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                  
                  <div className="space-y-0.5">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Divider */}
          <div className="h-px bg-gray-700/20" />

          {/* Event Analytics Section */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Event Analytics</h2>
              </div>
              <p className="text-sm text-gray-400">Comprehensive insights about your events</p>
            </div>

            <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl bg-gray-800/20 border border-gray-700/20">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY }}
                className="mb-3"
              >
                <BarChart3 className="h-12 w-12 text-gray-500 mx-auto" />
              </motion.div>

              <h3 className="text-lg font-semibold text-white mb-2">Coming Soon</h3>
              <p className="max-w-sm text-gray-400 text-sm leading-relaxed">
                Advanced analytics and detailed insights are being prepared to help you understand event performance.
              </p>

              <div className="mt-5 flex gap-2 justify-center flex-wrap">
                <div className="px-3 py-1.5 bg-gray-700/30 rounded-lg text-xs text-gray-300 border border-gray-600/30">
                  📊 Performance
                </div>
                <div className="px-3 py-1.5 bg-gray-700/30 rounded-lg text-xs text-gray-300 border border-gray-600/30">
                  💡 Insights
                </div>
                <div className="px-3 py-1.5 bg-gray-700/30 rounded-lg text-xs text-gray-300 border border-gray-600/30">
                  📈 Growth
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-700/20" />

          {/* Upcoming Features */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Features in Development
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Real-time Charts", desc: "Live performance data" },
                { title: "Export Reports", desc: "Download in PDF/CSV" },
                { title: "Predictions", desc: "AI-powered forecasts" },
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-gray-800/40 border border-gray-700/30 hover:border-gray-600/50 rounded-2xl hover:bg-gray-800/60 transition-all duration-300">
                  <p className="font-medium text-sm text-white">{feature.title}</p>
                  <p className="text-xs text-gray-400 mt-2">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
