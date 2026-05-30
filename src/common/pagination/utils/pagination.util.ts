export class PaginationUtil {
    static getSkip(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    static getTotalPages(totalItems: number, limit: number): number {
        return Math.ceil(totalItems / limit);
    }

    static getPaginationMetadata(page: number, limit: number, totalItems: number) {
        return {
            page,
            limit,
            totalItems,
            totalPages: this.getTotalPages(totalItems, limit),
        };
    }
}
