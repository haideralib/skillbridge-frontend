

export interface Pagination<t> {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    data: t[];
}