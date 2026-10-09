/**
 * Pre-Written Review Generator Service for ReviewFlow AI
 * 
 * Generates rating-aware pre-written review variations grouped by style:
 * 1. Casual & Friendly
 * 2. Short & Direct
 * 3. Detailed Experience
 */

export interface ReviewOption {
  id: string;
  category: "CASUAL & FRIENDLY" | "SHORT & DIRECT" | "DETAILED";
  styleLabel: string;
  text: string;
}

export interface ReviewGeneratorParams {
  rating: number; // 1 to 5
  selectedTags?: string[];
  additionalComment?: string;
  businessName?: string;
}

export function mockGenerateReviewOptions({
  rating,
  selectedTags = [],
  additionalComment = "",
  businessName = "Namoka",
}: ReviewGeneratorParams): ReviewOption[] {
  const name = businessName || "Namoka";
  const tagsUpper = selectedTags.map((t) => t.toUpperCase());

  const hasStaff = tagsUpper.some((t) => t.includes("STAFF") || t.includes("SERVICE") || t.includes("PEOPLE"));
  const hasTaste = tagsUpper.some((t) => t.includes("TASTE") || t.includes("FOOD") || t.includes("DRINK"));
  const hasValue = tagsUpper.some((t) => t.includes("VALUE") || t.includes("PRICE") || t.includes("MONEY"));
  const hasOverall = tagsUpper.some((t) => t.includes("OVERALL") || t.includes("VIBE") || t.includes("AMBIENCE"));

  const commentTrimmed = additionalComment ? additionalComment.trim() : "";
  const cleanedComment = commentTrimmed.replace(/[.]+$/, "");
  const commentFormatted = cleanedComment
    ? cleanedComment.charAt(0).toUpperCase() + cleanedComment.slice(1)
    : "";

  const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));

  let casualText = "";
  let shortText = "";
  let detailedText = "";

  if (clampedRating === 5) {
    if (hasStaff && hasTaste) {
      casualText = `Really enjoyed my visit to ${name}! The food was delicious and the staff were genuinely friendly and welcoming. Great atmosphere too — I'll definitely be coming back.`;
    } else if (hasStaff) {
      casualText = `Had a lovely experience at ${name}. The staff were friendly, welcoming, and made the whole visit feel really comfortable. Would definitely come back.`;
    } else if (hasTaste) {
      casualText = `Really enjoyed my visit to ${name}! The food and drinks were excellent and everything tasted fresh and well prepared.`;
    } else if (hasValue) {
      casualText = `Really enjoyed ${name}. The food was great, the service was friendly, and the overall experience felt well worth it.`;
    } else {
      casualText = `Really enjoyed my visit to ${name}! Everything was well prepared and the overall experience was great. Definitely coming back.`;
    }

    if (hasTaste) {
      shortText = `Everything we ordered at ${name} tasted amazing! Super fresh and full of flavor. 10/10!`;
    } else if (hasStaff) {
      shortText = `Super friendly service at ${name}! Helpful and attentive staff. Will return!`;
    } else {
      shortText = `Great visit to ${name}. Good food, great service, and a super pleasant vibe!`;
    }

    if (hasStaff && hasTaste) {
      detailedText = `Stopped by ${name} today and was super impressed. The staff were warm and attentive, and every single dish tasted fantastic. Easily one of my favorite spots in town.`;
    } else if (hasValue || hasOverall) {
      detailedText = `Outstanding value and fantastic vibe at ${name}. From the moment we walked in to the final check, everything was handled with care and quality.`;
    } else {
      detailedText = `Visited ${name} today and had a fantastic time. The team operates seamlessly and the quality is consistently top notch. Looking forward to my next visit.`;
    }

    if (commentFormatted) {
      casualText = `Had a really nice experience at ${name}. ${commentFormatted}. I'll definitely be coming back!`;
      shortText = `${name} was great! ${commentFormatted}. Highly recommend!`;
      detailedText = `Stopped by ${name} today and had a wonderful time. ${commentFormatted}. Can't wait for my next visit.`;
    }
  } else if (clampedRating === 4) {
    casualText = `Very pleasant visit to ${name}. Most things were spot on and the service was warm and prompt. Solid spot worth visiting.`;
    shortText = `Solid experience at ${name}. Good quality, nice atmosphere, and quick service.`;
    detailedText = `Overall a very good visit to ${name}. Service was helpful, food was satisfying, and the overall experience was great.`;

    if (commentFormatted) {
      casualText = `Very pleasant visit to ${name}. ${commentFormatted}. Overall a positive experience.`;
      shortText = `Good time at ${name}. ${commentFormatted}. Worth checking out!`;
      detailedText = `Visited ${name} today and enjoyed it. ${commentFormatted}. Looking forward to returning.`;
    }
  } else if (clampedRating === 3) {
    casualText = `Had a decent experience at ${name}. The staff were friendly and food was okay, though there is some room for improvement.`;
    shortText = `Average visit to ${name}. Polite service, but overall fairly standard experience.`;
    detailedText = `Mixed thoughts on ${name}. Service was polite, but a few items could be better executed. Decent option overall.`;

    if (commentFormatted) {
      casualText = `Had an okay experience at ${name}. ${commentFormatted}. Overall fairly average.`;
      shortText = `Decent visit to ${name}. ${commentFormatted}.`;
      detailedText = `Visited ${name} today. ${commentFormatted}. Some room for improvement.`;
    }
  } else if (clampedRating === 2) {
    casualText = `My experience at ${name} was mixed. Friendly staff, but a few key things could be improved. Hope to see a better visit next time.`;
    shortText = `Below expectations at ${name}. Service was slow and a few items didn't meet standard today.`;
    detailedText = `Room for improvement at ${name}. Had higher hopes, but the overall service and quality didn't fully land today.`;

    if (commentFormatted) {
      casualText = `My visit to ${name} had issues. ${commentFormatted}. Hope improvements are made.`;
      shortText = `Disappointing visit to ${name}. ${commentFormatted}.`;
      detailedText = `Had some trouble at ${name}. ${commentFormatted}. Needs attention.`;
    }
  } else {
    // 1 STAR
    casualText = `My experience at ${name} wasn't what I expected. Several things could have been better. I hope the team takes the feedback seriously.`;
    shortText = `Disappointed with my visit to ${name}. Quality and service fell short of basic expectations today.`;
    detailedText = `Unfortunately had a poor experience at ${name}. Multiple issues during the visit. Hope management reviews this feedback.`;

    if (commentFormatted) {
      casualText = `Disappointing visit to ${name}. ${commentFormatted}. Hope management addresses these issues.`;
      shortText = `Poor experience at ${name}. ${commentFormatted}.`;
      detailedText = `Very unhappy with my visit to ${name}. ${commentFormatted}. Needs immediate improvement.`;
    }
  }

  return [
    {
      id: "casual",
      category: "CASUAL & FRIENDLY",
      styleLabel: "Casual & Friendly",
      text: casualText,
    },
    {
      id: "short",
      category: "SHORT & DIRECT",
      styleLabel: "Short & Direct",
      text: shortText,
    },
    {
      id: "detailed",
      category: "DETAILED",
      styleLabel: "Detailed Experience",
      text: detailedText,
    },
  ];
}
