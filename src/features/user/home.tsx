import React from "react";
import Hero from "../../components/userside/heroSection";
import ShopByCategorySection from "../../components/userside/trustSection";
import BestsellersSection from "../../components/userside/bestsellersSection";
import HowItWorksSection from "../../components/userside/howitworksSection";
import FreshnessSection from "../../components/userside/freshnessSection";
import OffersSection from "../../components/userside/offersSection";
import ReviewsSection from "../../components/userside/reviewsSection";
import ProfileCompletionModal from "../../components/userside/ProfileCompletionModal";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const Home: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const completedKey = `profile_completed_${user.id}`;
      const alreadyCompleted = localStorage.getItem(completedKey);
      if (!alreadyCompleted) {
        setShowProfileModal(true);
      }
    }
  }, [isAuthenticated, user]);

  return (
    <div className="flex flex-col bg-white">
      <Hero />
      <ShopByCategorySection />
      <BestsellersSection />
      <HowItWorksSection />
      <FreshnessSection />
      <OffersSection />
      <ReviewsSection />

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
      />
    </div>
  );
};

export default Home;
