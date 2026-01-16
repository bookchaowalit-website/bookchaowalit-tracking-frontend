import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ContentCategory, TrackingStatus, RatingScale } from '@prisma/client';

// Run on Node.js runtime so Prisma Client is supported
export const runtime = 'nodejs';

const INTERNAL_SECRET_HEADER = 'x-internal-secret';

function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Basic secret check to prevent public access
function checkSecret(request: NextRequest) {
    const secret = request.headers.get(INTERNAL_SECRET_HEADER);
    return secret && secret === process.env.INTERNAL_API_SECRET;
}

export async function GET(request: NextRequest) {
    if (!checkSecret(request)) return unauthorized();

    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const category = searchParams.get('category') as ContentCategory | null;
        const status = searchParams.get('status') as TrackingStatus | null;
        const isFavorite = searchParams.get('isFavorite') === 'true';
        const search = searchParams.get('search');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const where: any = {
            userTrackings: {
                some: { userId }
            }
        };

        if (category) where.category = category;
        if (status) where.userTrackings = { some: { userId, status } };
        if (isFavorite) where.userTrackings = { some: { userId, isFavorite: true } };
        if (search) where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } }
        ];

        const items = await prisma.trackingItem.findMany({
            where,
            include: {
                userTrackings: {
                    where: { userId },
                    select: {
                        status: true,
                        rating: true,
                        progress: true,
                        startDate: true,
                        finishDate: true,
                        priority: true,
                        isFavorite: true,
                    }
                },
                _count: { select: { userTrackings: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching tracking items:', error);
        return NextResponse.json({ error: 'Failed to fetch tracking items' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!checkSecret(request)) return unauthorized();

    try {
        const body = await request.json();
        const {
            userId,
            title,
            description,
            imageUrl,
            externalUrl,
            category,
            author,
            year,
            genres,
            totalEpisodes,
            totalChapters,
            totalBooks,
            status,
            rating,
            progress,
            priority,
            isFavorite
        } = body;

        if (!userId || !title || !category) {
            return NextResponse.json({ error: 'User ID, title, and category are required' }, { status: 400 });
        }

        // Ensure user exists
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const existingItem = await prisma.trackingItem.findFirst({
            where: { title: { equals: title, mode: 'insensitive' }, category }
        });

        let trackingItem;

        if (existingItem) {
            trackingItem = await prisma.userTracking.create({
                data: {
                    userId,
                    itemId: existingItem.id,
                    status: status || TrackingStatus.PLAN_TO_WATCH,
                    rating: rating ? RatingScale[rating as keyof typeof RatingScale] : null,
                    progress,
                    priority,
                    isFavorite: isFavorite || false,
                },
                include: { item: true }
            });

            await prisma.activityLog.create({
                data: {
                    userId,
                    action: 'added_to_list',
                    itemTitle: existingItem.title,
                    category: existingItem.category,
                }
            });
        } else {
            const newItem = await prisma.trackingItem.create({
                data: {
                    title,
                    description,
                    imageUrl,
                    externalUrl,
                    category: category as ContentCategory,
                    author,
                    year,
                    genres: genres || [],
                    totalEpisodes,
                    totalChapters,
                    totalBooks,
                    userTrackings: {
                        create: {
                            userId,
                            status: status || TrackingStatus.PLAN_TO_WATCH,
                            rating: rating ? RatingScale[rating as keyof typeof RatingScale] : null,
                            progress,
                            priority,
                            isFavorite: isFavorite || false,
                        }
                    }
                },
                include: { userTrackings: { where: { userId } } }
            });

            await prisma.activityLog.create({
                data: {
                    userId,
                    action: 'created_item',
                    itemTitle: newItem.title,
                    category: newItem.category,
                }
            });

            trackingItem = newItem;
        }

        return NextResponse.json(trackingItem, { status: 201 });
    } catch (error) {
        console.error('Error creating tracking item:', error);
        return NextResponse.json({ error: 'Failed to create tracking item' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    if (!checkSecret(request)) return unauthorized();

    try {
        const body = await request.json();
        const { userId, itemId, status, rating, progress, startDate, finishDate, priority, isFavorite } = body;

        if (!userId || !itemId) {
            return NextResponse.json({ error: 'User ID and item ID are required' }, { status: 400 });
        }

        const currentTracking = await prisma.userTracking.findUnique({
            where: { userId_itemId: { userId, itemId } },
            include: { item: true }
        });

        if (!currentTracking) {
            return NextResponse.json({ error: 'Tracking item not found' }, { status: 404 });
        }

        const updatedTracking = await prisma.userTracking.update({
            where: { userId_itemId: { userId, itemId } },
            data: {
                status: status || undefined,
                rating: rating ? RatingScale[rating as keyof typeof RatingScale] : undefined,
                progress,
                startDate: startDate ? new Date(startDate) : undefined,
                finishDate: finishDate ? new Date(finishDate) : undefined,
                priority,
                isFavorite
            },
            include: { item: true }
        });

        if (status === TrackingStatus.COMPLETED && currentTracking.status !== TrackingStatus.COMPLETED) {
            await prisma.activityLog.create({
                data: {
                    userId,
                    action: 'completed',
                    itemTitle: currentTracking.item.title,
                    category: currentTracking.item.category,
                    details: `Rated ${rating || 'unrated'}`,
                }
            });
        } else if (rating && rating !== currentTracking.rating) {
            await prisma.activityLog.create({
                data: {
                    userId,
                    action: 'rated',
                    itemTitle: currentTracking.item.title,
                    category: currentTracking.item.category,
                    details: `Rated ${rating}/10`,
                }
            });
        }

        return NextResponse.json(updatedTracking);
    } catch (error) {
        console.error('Error updating tracking item:', error);
        return NextResponse.json({ error: 'Failed to update tracking item' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!checkSecret(request)) return unauthorized();

    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const itemId = searchParams.get('itemId');

        if (!userId || !itemId) {
            return NextResponse.json({ error: 'User ID and item ID are required' }, { status: 400 });
        }

        const tracking = await prisma.userTracking.findUnique({
            where: { userId_itemId: { userId, itemId } },
            include: { item: true }
        });

        if (!tracking) {
            return NextResponse.json({ error: 'Tracking item not found' }, { status: 404 });
        }

        await prisma.userTracking.delete({ where: { userId_itemId: { userId, itemId } } });

        await prisma.activityLog.create({
            data: {
                userId,
                action: 'removed_from_list',
                itemTitle: tracking.item.title,
                category: tracking.item.category,
            }
        });

        return NextResponse.json({ message: 'Tracking item removed successfully' });
    } catch (error) {
        console.error('Error deleting tracking item:', error);
        return NextResponse.json({ error: 'Failed to delete tracking item' }, { status: 500 });
    }
}
