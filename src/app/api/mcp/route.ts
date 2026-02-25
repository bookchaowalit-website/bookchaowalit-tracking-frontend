import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SERVER_INFO = {
  name: 'tracking',
  version: '1.0.0',
  description: 'TrackIt MCP Server - Personal content tracking platform'
};

const TOOLS = [
  {
    name: 'get_tracking_items',
    description: 'Get tracked content items with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['anime', 'manga', 'movie', 'tv', 'book', 'game', 'podcast', 'website', 'other'] },
        status: { type: 'string', enum: ['planning', 'watching', 'reading', 'completed', 'on_hold', 'dropped'] },
        favorites: { type: 'boolean' }
      }
    }
  },
  {
    name: 'add_tracking_item',
    description: 'Add a new item to track',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        category: { type: 'string' },
        status: { type: 'string' }
      },
      required: ['title', 'category', 'status']
    }
  },
  {
    name: 'update_tracking_progress',
    description: 'Update progress for a tracked item',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        progress: { type: 'number' },
        status: { type: 'string' }
      },
      required: ['id', 'progress']
    }
  },
  {
    name: 'get_statistics',
    description: 'Get tracking statistics and overview',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

export async function GET() {
  return NextResponse.json({
    ...SERVER_INFO,
    endpoints: { mcp: '/api/mcp' },
    availableMethods: ['initialize', 'tools/list', 'tools/call']
  });
}

async function handleMCPRequest(request: NextRequest) {
  try {
    const body = await request.json();
    const { method, params } = body;

    switch (method) {
      case 'initialize':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: requestId,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: SERVER_INFO
          }
        });

      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: requestId,
          result: { tools: TOOLS }
        });

      case 'tools/call':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: requestId,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify({
                tool: params.name,
                message: 'Implement your tracking logic here'
              })
            }]
          }
        });

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: requestId,
          error: { code: -32601, message: 'Method not found' }
        });
    }
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32700, message: 'Parse error' }
    }, { status: 400 });
  }
}

export { handleMCPRequest as POST };
