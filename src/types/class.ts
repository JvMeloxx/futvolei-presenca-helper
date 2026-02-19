
export interface ClassParticipant {
    id: string;
    user_id: string;
    class_id: string;
    created_at: string;
    user_details?: {
        full_name: string;
        avatar_url: string | null;
    };
}

export interface ClassDetails {
    id: string;
    day: string;
    time: string;
    date: string;
    location: string;
    instructor: string;
    max_participants: number;
    confirmed_count: number;
    participants?: ClassParticipant[];
    user_confirmed?: boolean;
}

export interface TimeSlot {
    time: string;
    instructor: string;
    location: string;
    max_participants: number;
}

export interface ClassSchedule {
    [day: string]: {
        [timeSlot: string]: TimeSlot;
    };
}
