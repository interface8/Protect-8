"use client";

import { useState } from "react";
import { X, Calendar, Clock, Video, Users, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyerName: string;
  lawyerId: string;
}

export default function BookingModal({ isOpen, onClose, lawyerName, lawyerId }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [consultationType, setConsultationType] = useState<"virtual" | "physical">("virtual");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});

  if (!isOpen) return null;

  const validateDate = (selectedDate: string): string | null => {
    if (!selectedDate) return "Please select a date";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) return "Date must be today or in the future";
    return null;
  };

  const validateTime = (selectedTime: string): string | null => {
    if (!selectedTime) return "Please select a time";
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 480) return "Time must be after 8:00 AM";
    if (totalMinutes > 1200) return "Time must be before 8:00 PM";
    return null;
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    const error = validateDate(value);
    setErrors((prev) => ({ ...prev, date: error || undefined }));
  };

  const handleTimeChange = (value: string) => {
    setTime(value);
    const error = validateTime(value);
    setErrors((prev) => ({ ...prev, time: error || undefined }));
  };

  const handleConfirm = async () => {
    const dateError = validateDate(date);
    const timeError = validateTime(time);

    if (dateError || timeError) {
      setErrors({
        date: dateError || undefined,
        time: timeError || undefined,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawyerProfileId: lawyerId,
          category: "General Consultation",
          title: `${consultationType} consultation on ${date} at ${time}`,
          description: `Consultation scheduled for ${date} at ${time}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ time: data.message ?? "Booking failed" });
        return;
      }

      setStep(3);
    } catch {
      setErrors({ time: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setConsultationType("virtual");
    setDate("");
    setTime("");
    setErrors({});
    onClose();
  };

  if (step === 3) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your consultation with <span className="font-semibold">{lawyerName}</span> has been scheduled.
          </p>
          <div className="bg-[#f3f4f6] rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium text-black capitalize">{consultationType}</span>
            </div>
            {date && (
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-black">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {time && (
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium text-black">{time}</span>
              </div>
            )}
          </div>
          <Button onClick={handleClose} className="w-full bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 rounded-xl font-semibold">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#0a0a0a]">Book a Consultation</h2>
          <p className="text-gray-500 text-sm">with {lawyerName}</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className={`w-3 h-3 rounded-full ${step === 1 ? "bg-[#c4922a]" : "bg-[#c4922a]/30"}`} />
          <div className="w-12 h-0.5 bg-[#c4922a]/30" />
          <div className={`w-3 h-3 rounded-full ${step === 2 ? "bg-[#c4922a]" : "bg-[#c4922a]/30"}`} />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Select consultation type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConsultationType("virtual")}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  consultationType === "virtual"
                    ? "border-[#c4922a] bg-[#c4922a]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-[#554116]" />
                <span className="text-sm font-medium text-black">Virtual</span>
              </button>
              <button
                onClick={() => setConsultationType("physical")}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  consultationType === "physical"
                    ? "border-[#c4922a] bg-[#c4922a]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-2 text-[#554116]" />
                <span className="text-sm font-medium text-black">Physical</span>
              </button>
            </div>
            <Button onClick={() => setStep(2)} className="w-full bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 rounded-xl font-semibold">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-black">
                Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`pl-10 h-11 border-gray-200 rounded-xl ${
                    errors.date ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {errors.date && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="time" className="text-sm font-medium text-black">
                Time <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className={`pl-10 h-11 border-gray-200 rounded-xl ${
                    errors.time ? "border-red-500 focus-visible:ring-red-500" : ""
                  }`}
                  min="08:00"
                  max="20:00"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Business hours: 8:00 AM — 8:00 PM</p>
              {errors.time && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.time}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep(1);
                  setErrors({});
                }}
                variant="outline"
                className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 h-12 rounded-xl"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!date || !time || loading}
                className="flex-1 bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}