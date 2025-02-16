import { Injectable, NotFoundException } from '@nestjs/common';
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

  // Bookmark Collection CRUD
  async createCollection(createDto: CreateBookmarkCollectionDto): Promise<BookmarkCollection> {
    const collection = this.bookmarkCollectionRepository.create(createDto);
    return this.bookmarkCollectionRepository.save(collection);
  }

  async findAllCollections(): Promise<BookmarkCollection[]> {
    return this.bookmarkCollectionRepository.find();
  }

  async findOneCollection(id: number): Promise<BookmarkCollection> {
    const collection = await this.bookmarkCollectionRepository.findOne({ where: { id } });
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }
    return collection;
  }

  async updateCollection(id: number, updateDto: UpdateBookmarkCollectionDto): Promise<BookmarkCollection> {
    const collection = await this.findOneCollection(id);
    this.bookmarkCollectionRepository.merge(collection, updateDto);
    return this.bookmarkCollectionRepository.save(collection);
  }

  async removeCollection(id: number): Promise<void> {
    const collection = await this.findOneCollection(id);
    await this.bookmarkCollectionRepository.remove(collection);
  }

  // Post Bookmark CRUD
  async createPostBookmark(createDto: CreatePostBookmarkDto): Promise<PostBookmark> {
    const collection = await this.bookmarkCollectionRepository.findOneBy({
        id: createDto.collectionId
    })
    if (!collection) {
      throw new NotFoundException(`BookmarkCollection with ID ${createDto.collectionId} not found`);
    }

    const post = await this.postRepository.findOneBy({
        id: createDto.postId
    });
    if (!post) {
      throw new NotFoundException(`Post with ID ${createDto.postId} not found`);
    }

    const postBookmark = this.postBookmarkRepository.create({
      collection,
      date: new Date(),
    });

    return this.postBookmarkRepository.save(postBookmark);
  }

  async findAllPostBookmarks(): Promise<PostBookmark[]> {
    return this.postBookmarkRepository.find({
      relations: ['collection'], 
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

  async updatePostBookmark(id: number, updateDto: UpdatePostBookmarkDto): Promise<PostBookmark> {
    const postBookmark = await this.findOnePostBookmark(id);

    if (updateDto.collectionId) {
      const collection = await this.bookmarkCollectionRepository.findOne({
        where: { id: updateDto.collectionId },
      });
      if (!collection) {
        throw new NotFoundException(`BookmarkCollection with ID ${updateDto.collectionId} not found`);
      }
      postBookmark.collection = collection;
    }

    return this.postBookmarkRepository.save(postBookmark);
  }

  async removePostBookmark(id: number): Promise<void> {
    const postBookmark = await this.findOnePostBookmark(id);
    await this.postBookmarkRepository.remove(postBookmark);
  }
}