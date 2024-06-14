type AddWorkshopReqEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
};

type AddWorkshopCreateEntity = {
    start_at: string;
    end_at: string;
    participation_method: string;
    content?: string;
    preparation?: string;
    materials?: string;
    user_id: UUID;
};
