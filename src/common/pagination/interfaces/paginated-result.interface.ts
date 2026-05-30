export interface PaginatedResult<T> {
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}
