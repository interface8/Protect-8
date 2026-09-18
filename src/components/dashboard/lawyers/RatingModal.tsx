"use client";

import { useState } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRated?: () => void;
  lawyerName: string;
  lawyerId: string;
  requestId: string;
}

export default function RatingModal({
  isOpen,
  onClose,
  onRated,
  lawyerName,
  requestId,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/requests/${requestId}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          onClose();
          return;
        }
        setError(data.message ?? "Failed to submit rating");
        return;
      }

      setSubmitted(true);
      if (onRated) onRated();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-[#c4922a] fill-[#c4922a]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a] mb-2">Thank You!</h2>
          <p className="text-gray-600">Your review helps others find the right lawyer.</p>
          <p className="text-sm text-gray-400 mt-4">{rating} stars · {comment || "No comment"}</p>
          <Button
            onClick={onClose}
            className="w-full mt-6 bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 rounded-xl font-semibold"
          >
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
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#0a0a0a]">Rate Your Experience</h2>
          <p className="text-gray-500 text-sm mt-1">How was your consultation with {lawyerName}?</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= (hoverRating || rating)
                    ? "fill-[#c4922a] text-[#c4922a]"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            {rating === 0 && "Select a rating"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="text-sm font-medium text-black">
            Write a review <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className="w-full mt-1 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#c4922a] focus:border-transparent h-24 text-sm"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className="w-full bg-[#c4922a] hover:bg-[#c4922a]/80 text-white h-12 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </Button>
      </div>
    </div>
  );
}