import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let requestId: number | string = 0;

  try {
    const body = await request.json();
    const { method, params } = body;

    let result;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: 'TrackIt API',
            version: '1.0.0',
            description: 'Content tracking and management system'
          }
        };
        break;

      case 'tools/list':
        result = {
          tools: [
            {
              name: 'get_categories',
              description: 'Get all content categories (Movie, TVSeries, Anime, Manga, Book, Game, Podcast, Music, Other)',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'get_statuses',
              description: 'Get all tracking statuses (Watching, Reading, Playing, Listening, Completed, OnHold, Dropped, PlanToWatch)',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'get_rating_scales',
              description: 'Get available rating scales (One to Ten)',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: 'get_sort_options',
              description: 'Get available sorting options for content',
              inputSchema: {
                type: 'object',
                properties: {}
              }
            }
          ]
        };
        break;

      case 'tools/call':
        const toolName = params?.name;

        switch (toolName) {
          case 'get_categories':
            result = ['Movie', 'TVSeries', 'Anime', 'Manga', 'Book', 'Game', 'Podcast', 'Music', 'Other'];
            break;

          case 'get_statuses':
            result = ['Watching', 'Reading', 'Playing', 'Listening', 'Completed', 'OnHold', 'Dropped', 'PlanToWatch'];
            break;

          case 'get_rating_scales':
            result = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
            break;

          case 'get_sort_options':
            result = ['title', 'startDate', 'finishDate', 'rating', 'priority'];
            break;

          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }
        break;

      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id: requestId,
      result
    });

  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: requestId || 1,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: error
      }
    }, { status: 500 });
  }
}
