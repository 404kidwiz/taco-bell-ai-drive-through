"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Globe,
  CreditCard,
  Phone as PhoneIcon,
  Code,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function SettingsPage() {
  const [restaurantName, setRestaurantName] = useState("Taco Bell Demo Store");
  const [phone, setPhone] = useState("+1 (770) 525-5393");
  const [address, setAddress] = useState("123 Taco Lane, Atlanta, GA 30301");
  const [timezone, setTimezone] = useState("America/New_York");
  const [hours, setHours] = useState<Record<string, { open: string; close: string; closed?: boolean }>>({
    monday: { open: "09:00", close: "22:00" },
    tuesday: { open: "09:00", close: "22:00" },
    wednesday: { open: "09:00", close: "22:00" },
    thursday: { open: "09:00", close: "22:00" },
    friday: { open: "09:00", close: "23:00" },
    saturday: { open: "10:00", close: "23:00" },
    sunday: { open: "10:00", close: "21:00" },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);
  };

  const handleCopyWidget = () => {
    const widgetCode = `<script src="https://app.orderflow.ai/widget.js" data-restaurant="taco-bell-demo" async></script>`;
    navigator.clipboard.writeText(widgetCode);
    setCopiedWidget(true);
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  const updateHours = (day: string, field: "open" | "close", value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const toggleClosed = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Settings</h1>
        <p className="text-[#948DA3] text-sm mt-1">Manage your restaurant profile and integrations</p>
      </div>

      {/* Restaurant Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#6D28FF]/20 flex items-center justify-center">
            <Store className="text-[#6D28FF]" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Restaurant Profile</h2>
            <p className="text-[#948DA3] text-sm">Basic information about your restaurant</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[#948DA3] text-sm">Restaurant Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
            />
          </div>
          <div>
            <label className="text-[#948DA3] text-sm">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-[#948DA3] text-sm">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
            />
          </div>
          <div>
            <label className="text-[#948DA3] text-sm">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Business Hours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#12D7F2]/20 flex items-center justify-center">
            <Clock className="text-[#12D7F2]" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Business Hours</h2>
            <p className="text-[#948DA3] text-sm">When your restaurant is open for orders</p>
          </div>
        </div>

        <div className="space-y-3">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-28">
                <span className="text-white font-medium capitalize">{day}</span>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hours[day].closed}
                  onChange={() => toggleClosed(day)}
                  className="w-4 h-4 rounded border-[#494457] bg-[#0a0612] text-[#6D28FF] focus:ring-[#6D28FF] focus:ring-offset-0"
                />
                <span className="text-[#948DA3] text-sm">Open</span>
              </label>
              {!hours[day].closed && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={(e) => updateHours(day, "open", e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
                  />
                  <span className="text-[#948DA3]">to</span>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={(e) => updateHours(day, "close", e.target.value)}
                    className="px-3 py-2 rounded-lg bg-[#0a0612] border border-[#494457] text-white focus:outline-none focus:border-[#6D28FF]"
                  />
                </div>
              )}
              {hours[day].closed && (
                <span className="text-[#948DA3] text-sm">Closed</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <CreditCard className="text-green-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Integrations</h2>
            <p className="text-[#948DA3] text-sm">Connected services and APIs</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Twilio */}
          <div className="flex items-center justify-between p-4 bg-[#0a0612] rounded-xl">
            <div className="flex items-center gap-3">
              <PhoneIcon className="text-[#F22F46]" size={24} />
              <div>
                <p className="text-white font-medium">Twilio</p>
                <p className="text-[#948DA3] text-sm">Phone: +1 (770) 525-5393</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm">
              <CheckCircle size={14} />
              Connected
            </span>
          </div>

          {/* Stripe */}
          <div className="flex items-center justify-between p-4 bg-[#0a0612] rounded-xl">
            <div className="flex items-center gap-3">
              <CreditCard className="text-[#635BFF]" size={24} />
              <div>
                <p className="text-white font-medium">Stripe</p>
                <p className="text-[#948DA3] text-sm">Payment processing</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-sm">
              <CheckCircle size={14} />
              Connected
            </span>
          </div>
        </div>
      </motion.div>

      {/* Widget Embed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1e192b] border border-[#494457]/50 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#cebdff]/20 flex items-center justify-center">
            <Code className="text-[#cebdff]" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Widget Embed Code</h2>
            <p className="text-[#948DA3] text-sm">Add the AI ordering widget to your website</p>
          </div>
        </div>

        <div className="relative">
          <code className="block p-4 bg-[#0a0612] rounded-xl text-[#cebdff] text-sm overflow-x-auto">
            {`<script src="https://app.orderflow.ai/widget.js" data-restaurant="taco-bell-demo" async></script>`}
          </code>
          <button
            onClick={handleCopyWidget}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[#494457]/50 text-white text-sm hover:bg-[#494457] transition-colors"
          >
            {copiedWidget ? (
              <span className="flex items-center gap-1">
                <CheckCircle size={14} />
                Copied!
              </span>
            ) : (
              "Copy"
            )}
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1e192b] border border-red-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Danger Zone</h2>
              <p className="text-[#948DA3] text-sm">Irreversible actions</p>
            </div>
          </div>
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="text-red-400 text-sm hover:text-red-300"
          >
            {showDangerZone ? "Hide" : "Show"}
          </button>
        </div>

        {showDangerZone && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Download className="text-red-400" size={20} />
                <div>
                  <p className="text-white font-medium">Export All Data</p>
                  <p className="text-[#948DA3] text-sm">Download all your orders and settings</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Trash2 className="text-red-400" size={20} />
                <div>
                  <p className="text-white font-medium">Delete Restaurant</p>
                  <p className="text-[#948DA3] text-sm">Remove this restaurant and all its data</p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                Delete
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-[#6D28FF] text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
          Save Settings
        </button>
      </div>
    </div>
  );
}
