
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HomeHeader from '../components/home/HomeHeader';
import NextClassCard from '../components/home/NextClassCard';
import UpcomingClasses from '../components/home/UpcomingClasses';
import ClassConfirmationModal from '@/components/ClassConfirmationModal';
import { useAuth } from '@/contexts/NeonAuthContext';
import { useNeonClassManagement } from '@/hooks/useNeonClassManagement';

// No mocks needed here. Data comes from useNeonClassManagement

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    formattedDate,
    nextClass,
    upcomingClasses,
    selectedClass,
    showConfirmationModal,
    handleConfirmClass,
    handleConfirmNextClass,
    handleConfirmSuccess,
    handleCloseModal,
    currentTime
  } = useNeonClassManagement();

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header section */}
        <HomeHeader formattedDate={formattedDate} user={user} />

        {/* Next class section */}
        <NextClassCard
          nextClass={nextClass}
          currentTime={currentTime}
          onConfirm={handleConfirmNextClass}
          onViewClass={() => nextClass && handleConfirmClass(nextClass)}
        />

        {/* Upcoming classes section */}
        <UpcomingClasses
          upcomingClasses={upcomingClasses}
          onSelectClass={(classId, day, date, time) => {
            const classItem = upcomingClasses.find(c => c.id === classId);
            if (classItem) handleConfirmClass(classItem);
          }}
        />
      </div>

      {/* Confirmation Modal */}
      {selectedClass && (
        <ClassConfirmationModal
          isOpen={showConfirmationModal}
          onClose={handleCloseModal}
          classId={selectedClass.id}
          day={selectedClass.day}
          date={selectedClass.date || ''}
          time={selectedClass.time}
          userName={user?.full_name || 'Usuário'}
          isPreferredDay={selectedClass.isPreferredDay || false}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}
    </Layout>
  );
};

export default Index;
