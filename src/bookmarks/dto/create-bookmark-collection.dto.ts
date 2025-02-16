export class CreateBookmarkCollectionDto {
    readonly name: string;
    readonly description?: string;
    readonly isPrivate?: boolean;
    readonly userId: number;
}