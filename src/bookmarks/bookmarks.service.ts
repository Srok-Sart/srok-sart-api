import { Injectable, NotFoundException, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { PostBookmark } from './entities/post-bookmark.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateBookmarkCollectionDto } from './dto/create-bookmark-collection.dto';
import { UpdateBookmarkCollectionDto } from './dto/update-bookmark-collection.dto';
import { CreatePostBookmarkDto } from './dto/create-post-bookmark.dto';
import { UpdatePostBookmarkDto } from './dto/update-post-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(BookmarkCollection)
    private readonly bookmarkCollectionRepository: Repository<BookmarkCollection>,
    @InjectRepository(PostBookmark)
    private readonly postBookmarkRepository: Repository<PostBookmark>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async createCollection(
    createDto: CreateBookmarkCollectionDto,
    @Request() req,
  ): Promise<BookmarkCollection> {
    const collection = this.bookmarkCollectionRepository.create({
      ...createDto,
      _user: req.user,
    });

    return this.bookmarkCollectionRepository.save(collection);
  }

  async findAllCollections(): Promise<BookmarkCollection[]> {
    return this.bookmarkCollectionRepository.find();
  }

  async findOneCollection(id: number): Promise<BookmarkCollection> {
    const collection = await this.bookmarkCollectionRepository.findOne({
      where: { id },
    });
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return collection;
  }

  async updateCollection(
    id: number,
    updateDto: UpdateBookmarkCollectionDto,
  ): Promise<BookmarkCollection> {
    const collection = await this.findOneCollection(id);
  
    // Merge the updateDto with the existing collection
    this.bookmarkCollectionRepository.merge(collection, updateDto);
  
    // Save the updated collection
    return this.bookmarkCollectionRepository.save(collection);
  }

  async removeCollection(id: number): Promise<void> {
    const collection = await this.findOneCollection(id);
    await this.bookmarkCollectionRepository.remove(collection);
  }

  async createPostBookmark(
    createDto: CreatePostBookmarkDto,
  ): Promise<PostBookmark> {
    const collection = await this.bookmarkCollectionRepository.findOneBy({
      id: createDto.collectionId,
    });

    if (!collection) {
      throw new NotFoundException(
        `BookmarkCollection with ID ${createDto.collectionId} not found`,
      );
    }

    const post = await this.postRepository.findOneBy({
      id: createDto.postId,
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${createDto.postId} not found`);
    }

    const postBookmark = this.postBookmarkRepository.create({
      collection,
      post,
      date: new Date(),
    });

    return this.postBookmarkRepository.save(postBookmark);
  }

  async findAllPostBookmarks(): Promise<PostBookmark[]> {
    return this.postBookmarkRepository.find({
      relations: ['collection', 'post'],
    });
  }

  async findOnePostBookmark(id: number): Promise<PostBookmark> {
    const postBookmark = await this.postBookmarkRepository.findOne({
      where: { id },
      relations: ['collection'],
    });
    if (!postBookmark) {
      throw new NotFoundException(`Post Bookmark with ID ${id} not found`);
    }
    return postBookmark;
  }

  async findPostsInCollection(collectionId: number): Promise<Post[]> {
    const postBookmarks = await this.postBookmarkRepository.find({
      where: { collection: { id: collectionId } },
      relations: ['post'], // Include the post relation
    });
  
    // Extract and return the posts
    return postBookmarks.map((bookmark) => bookmark.post);
  }

  async updatePostBookmark(
    id: number,
    updateDto: UpdatePostBookmarkDto,
  ): Promise<PostBookmark> {
    const postBookmark = await this.findOnePostBookmark(id);

    if (updateDto.collectionId) {
      const collection = await this.bookmarkCollectionRepository.findOne({
        where: { id: updateDto.collectionId },
      });
      if (!collection) {
        throw new NotFoundException(
          `BookmarkCollection with ID ${updateDto.collectionId} not found`,
        );
      }
      postBookmark.collection = collection;
    }

    return this.postBookmarkRepository.save(postBookmark);
  }

  async removePostBookmark(id: number): Promise<void> {
    const postBookmark = await this.findOnePostBookmark(id);
    await this.postBookmarkRepository.remove(postBookmark);
  }

  async findAllPostBookmarksGroupedByCollection(): Promise<any> {
    const postBookmarks = await this.postBookmarkRepository.find({
      relations: ['collection', 'post'],
    });
  
    const groupedByCollection = postBookmarks.reduce((acc, bookmark) => {
      const collectionId = bookmark.collection.id;
      if (!acc[collectionId]) {
        acc[collectionId] = {
          ...bookmark.collection, // Include all collection properties
          posts: [], // Initialize posts array
        };
      }
      if (bookmark.post) {
        acc[collectionId].posts.push(bookmark.post);
      }
      return acc;
    }, {});
  
    return Object.values(groupedByCollection);
  }

  async unsavePostFromCollection(collectionId: number, postId: number): Promise<void> {
    await this.postBookmarkRepository.delete({ collection: { id: collectionId }, post: { id: postId } });
  }
}


