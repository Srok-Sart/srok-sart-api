import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateBookmarkCollectionDto } from './dto/create-bookmark-collection.dto';
import { CreatePostBookmarkDto } from './dto/create-post-bookmark.dto';
import { UpdateBookmarkCollectionDto } from './dto/update-bookmark-collection.dto';
import { UpdatePostBookmarkDto } from './dto/update-post-bookmark.dto';
import { BookmarkCollection } from './entities/bookmark-collection.entity';
import { PostBookmark } from './entities/post-bookmark.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(BookmarkCollection)
    private bookmarkCollectionRepository: Repository<BookmarkCollection>,
    @InjectRepository(PostBookmark)
    private postBookmarkRepository: Repository<PostBookmark>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async createCollection(
    createDto: CreateBookmarkCollectionDto,
    userId: number,
  ): Promise<BookmarkCollection> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const collection = this.bookmarkCollectionRepository.create({
      ...createDto,
      _user: user,
    });

    return this.bookmarkCollectionRepository.save(collection);
  }

  async findAllCollections(userId: number): Promise<BookmarkCollection[]> {
    return this.bookmarkCollectionRepository.find({
      where: { _user: { id: userId } },
    });
  }

  async findOneCollection(
    id: number,
    userId: number,
  ): Promise<BookmarkCollection> {
    const collection = await this.bookmarkCollectionRepository.findOne({
      where: { id, _user: { id: userId } },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  async updateCollection(
    id: number,
    updateDto: UpdateBookmarkCollectionDto,
    userId: number,
  ): Promise<BookmarkCollection> {
    const collection = await this.findOneCollection(id, userId);
    this.bookmarkCollectionRepository.merge(collection, updateDto);
    return this.bookmarkCollectionRepository.save(collection);
  }

  async removeCollection(id: number, userId: number): Promise<void> {
    const collection = await this.findOneCollection(id, userId);
    await this.bookmarkCollectionRepository.remove(collection);
  }

  async createPostBookmark(
    createDto: CreatePostBookmarkDto,
    userId: number,
  ): Promise<PostBookmark> {
    const collection = await this.bookmarkCollectionRepository.findOne({
      where: { id: createDto.collectionId, _user: { id: userId } },
    });

    if (!collection) {
      throw new NotFoundException(
        `BookmarkCollection with ID ${createDto.collectionId} not found`,
      );
    }

    const post = await this.postRepository.findOne({
      where: { id: createDto.postId },
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

  async findAllPostBookmarks(userId: number): Promise<PostBookmark[]> {
    return this.postBookmarkRepository.find({
      where: { collection: { _user: { id: userId } } },
      relations: ['collection', 'post'],
    });
  }

  async findPostsInCollection(
    collectionId: number,
    userId: number,
  ): Promise<Post[]> {
    const postBookmarks = await this.postBookmarkRepository.find({
      where: {
        collection: {
          id: collectionId,
          _user: { id: userId },
        },
      },
      relations: ['post'], // Move relations outside the where clause
    });

    return postBookmarks.map((bookmark) => bookmark.post);
  }

  async findAllPostBookmarksGroupedByCollection(
    userId: number,
  ): Promise<any> {
    const postBookmarks = await this.postBookmarkRepository.find({
      where: {
        collection: {
          _user: { id: userId },
        },
      },
      relations: ['collection', 'post'], // Move relations outside the where clause
    });

    const groupedByCollection = postBookmarks.reduce((acc, bookmark) => {
      const collectionId = bookmark.collection.id;
      if (!acc[collectionId]) {
        acc[collectionId] = {
          ...bookmark.collection,
          posts: [],
        };
      }
      if (bookmark.post) {
        acc[collectionId].posts.push(bookmark.post);
      }
      return acc;
    }, {});

    return Object.values(groupedByCollection);
  }

  async findOnePostBookmark(
    id: number,
    userId: number,
  ): Promise<PostBookmark> {
    const postBookmark = await this.postBookmarkRepository.findOne({
      where: { id, collection: { _user: { id: userId } } },
      relations: ['collection'],
    });

    if (!postBookmark) {
      throw new NotFoundException(`Post Bookmark with ID ${id} not found`);
    }

    return postBookmark;
  }

  async updatePostBookmark(
    id: number,
    updateDto: UpdatePostBookmarkDto,
    userId: number,
  ): Promise<PostBookmark> {
    const postBookmark = await this.findOnePostBookmark(id, userId);

    if (updateDto.collectionId) {
      const collection = await this.bookmarkCollectionRepository.findOne({
        where: { id: updateDto.collectionId, _user: { id: userId } },
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

  async removePostBookmark(id: number, userId: number): Promise<void> {
    const postBookmark = await this.findOnePostBookmark(id, userId);
    await this.postBookmarkRepository.remove(postBookmark);
  }

  async unsavePostFromCollection(
    collectionId: number,
    postId: number,
    userId: number,
  ): Promise<void> {
    await this.postBookmarkRepository.delete({
      collection: { id: collectionId, _user: { id: userId } },
      post: { id: postId },
    });
  }
}