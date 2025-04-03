
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import HomeHeader from '../components/home/HomeHeader';
import NextClassCard from '../components/home/NextClassCard';
import UpcomingClasses from '../components/home/UpcomingClasses';
import ClassConfirmationModal from '@/components/ClassConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';
import { useClassManagement } from '@/hooks/useClassManagement';

// Class schedule by day (same data structure as in Schedule.tsx)
const classesByDay = {
  monday: [
    { id: 'm1', time: '8:30', confirmedCount: 6 },
    { id: 'm2', time: '17:00', confirmedCount: 8 },
    { id: 'm3', time: '18:30', confirmedCount: 10 },
    { id: 'm4', time: '20:00', confirmedCount: 4 },
  ],
  tuesday: [
    { id: 't1', time: '6:30', confirmedCount: 3 },
    { id: 't2', time: '8:00', confirmedCount: 7 },
    { id: 't3', time: '12:00', confirmedCount: 5 },
    { id: 't4', time: '17:00', confirmedCount: 9 },
    { id: 't5', time: '18:30', confirmedCount: 12 },
    { id: 't6', time: '20:00', confirmedCount: 8 },
  ],
  wednesday: [
    { id: 'w1', time: '8:30', confirmedCount: 5 },
    { id: 'w2', time: '17:00', confirmedCount: 7 },
    { id: 'w3', time: '18:30', confirmedCount: 9 },
    { id: 'w4', time: '20:00', confirmedCount: 6 },
  ],
  thursday: [
    { id: 'th1', time: '6:30', confirmedCount: 4 },
    { id: 'th2', time: '8:00', confirmedCount: 6 },
    { id: 'th3', time: '12:00', confirmedCount: 8 },
    { id: 'th4', time: '17:00', confirmedCount: 10 },
    { id: 'th5', time: '18:30', confirmedCount: 12 },
    { id: 'th6', time: '20:00', confirmedCount: 7 },
  ],
};

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
  } = useClassManagement(classesByDay);

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
          onViewClass={() => nextClass && handleConfirmClass(nextClass.id, nextClass.day, nextClass.date, nextClass.time)}
        />
        
        {/* Upcoming classes section */}
        <UpcomingClasses 
          upcomingClasses={upcomingClasses} 
          onSelectClass={handleConfirmClass} 
        />
      </div>
      
      {/* Confirmation Modal */}
      {selectedClass && (
        <ClassConfirmationModal
          isOpen={showConfirmationModal}
          onClose={handleCloseModal}
          classId={selectedClass.id}
          day={selectedClass.day}
          date={selectedClass.date}
          time={selectedClass.time}
          userName={user?.user_metadata?.full_name || 'Usuário'}
          isPreferredDay={selectedClass.isPreferredDay}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}
    </Layout>
  );
};

export default Index;
