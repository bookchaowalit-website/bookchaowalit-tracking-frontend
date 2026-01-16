import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@trackit.com' },
    update: {},
    create: {
      email: 'demo@trackit.com',
      name: 'Demo User',
      password: hashedPassword,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  })

  console.log(`✅ Created user: ${user.email}`)

  // Create tracking items for different categories
  const trackingItems = [
    // Anime
    {
      title: 'Attack on Titan',
      description: 'Set in a world where humanity lives inside cities surrounded by enormous walls due to the Titans, gigantic humanoid creatures who devour humans.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BYjJjOWM4ZTEtZjY5ZC00N2JkLTk2NjgtY2VlMTU0YjNiY2I1XkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_.jpg',
      externalUrl: 'https://attackontitan.fandom.com',
      category: 'ANIME',
      author: 'Hajime Isayama',
      year: 2013,
      genres: ['Action', 'Fantasy', 'Dark Fantasy'],
      totalEpisodes: 87,
      totalChapters: null,
      totalBooks: null,
    },
    {
      title: 'One Piece',
      description: 'Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger.',
      imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjE5MzYwM2YtM2I0ZS00ZmY1LTljOGItZDM2NTcyZDRiNzE5XkEyXkFqcGdeQXVyMjgxNzQ0MjU@._V1_FMjpg_UX1000_.jpg',
      category: 'ANIME',
      author: 'Eiichiro Oda',
      year: 1999,
      genres: ['Adventure', 'Comedy', 'Action', 'Fantasy'],
      totalEpisodes: 1000,
      totalChapters: null,
      totalBooks: null,
    },

    // Manga
    {
      title: 'Berserk',
      description: 'Guts, a former mercenary now known as the Black Swordsman, is out for revenge.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Berserk_volume_1.jpg',
      category: 'MANGA',
      author: 'Kentaro Miura',
      year: 1989,
      genres: ['Action', 'Dark Fantasy', 'Horror'],
      totalEpisodes: null,
      totalChapters: 374,
      totalBooks: null,
    },
    {
      title: 'Death Note',
      description: 'Light Yagami is a genius student who discovers a supernatural notebook that allows him to kill anyone.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6f/Death_Note_Volume_1.jpg',
      category: 'MANGA',
      author: 'Tsugumi Ohba',
      year: 2003,
      genres: ['Mystery', 'Thriller', 'Supernatural'],
      totalEpisodes: null,
      totalChapters: 108,
      totalBooks: null,
    },

    // Movies
    {
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2e/Inception_%282010%29_theatrical_poster.jpg',
      category: 'MOVIE',
      author: 'Christopher Nolan',
      year: 2010,
      genres: ['Sci-Fi', 'Action', 'Thriller'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: null,
    },
    {
      title: 'Spirited Away',
      description: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Spirited_Away_Japanese_poster.jpg',
      category: 'MOVIE',
      author: 'Hayao Miyazaki',
      year: 2001,
      genres: ['Animation', 'Adventure', 'Fantasy'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: null,
    },

    // TV Shows
    {
      title: 'Breaking Bad',
      description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/42/Breaking_Bbad_logo.png',
      category: 'TV_SHOW',
      author: 'Vince Gilligan',
      year: 2008,
      genres: ['Crime', 'Drama', 'Thriller'],
      totalEpisodes: 62,
      totalChapters: null,
      totalBooks: null,
    },
    {
      title: 'Stranger Things',
      description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/63/Stranger_Things_logo.png',
      category: 'TV_SHOW',
      author: 'The Duffer Brothers',
      year: 2016,
      genres: ['Horror', 'Sci-Fi', 'Drama'],
      totalEpisodes: 42,
      totalChapters: null,
      totalBooks: null,
    },

    // Books
    {
      title: 'The Great Gatsby',
      description: 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg',
      category: 'BOOK',
      author: 'F. Scott Fitzgerald',
      year: 1925,
      genres: ['Classic', 'Fiction', 'Tragedy'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: 1,
    },
    {
      title: 'Dune',
      description: 'Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/de/Dune-Frank_Herbert_%281965%29_First_edition.jpg',
      category: 'BOOK',
      author: 'Frank Herbert',
      year: 1965,
      genres: ['Sci-Fi', 'Adventure', 'Drama'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: 6,
    },

    // Games
    {
      title: 'The Legend of Zelda: Breath of the Wild',
      description: 'Link wakes up from a deep sleep to a ruined Hyrule. He must defeat Calamity Ganon and save the kingdom.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
      category: 'GAME',
      author: 'Nintendo EPD',
      year: 2017,
      genres: ['Action-Adventure', 'Open World', 'Fantasy'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: null,
    },
    {
      title: 'Elden Ring',
      description: 'From the creators of Dark Souls and Bloodborne comes a new fantasy action RPG.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Elden_Ring_box_art.jpg',
      category: 'GAME',
      author: 'FromSoftware',
      year: 2022,
      genres: ['Action RPG', 'Open World', 'Souls-like'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: null,
    },

    // Podcasts
    {
      title: 'The Joe Rogan Experience',
      description: 'A long-form conversation podcast covering a wide range of topics with various guests.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/6/67/Joe_Rogan_Experience_logo.png',
      category: 'PODCAST',
      author: 'Joe Rogan',
      year: 2009,
      genres: ['Comedy', 'Interview', 'Current Events'],
      totalEpisodes: 2000,
      totalChapters: null,
      totalBooks: null,
    },
    {
      title: 'Hardcore History',
      description: 'Dan Carlin explores the depths of history with his unique storytelling style.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dc/Hardcore_History_logo.jpg',
      category: 'PODCAST',
      author: 'Dan Carlin',
      year: 2005,
      genres: ['History', 'Education', 'Storytelling'],
      totalEpisodes: 70,
      totalChapters: null,
      totalBooks: null,
    },

    // Websites
    {
      title: 'Hacker News',
      description: 'A social news website focusing on computer science and entrepreneurship.',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Y_Combinator_logo.svg',
      category: 'WEBSITE',
      author: 'Y Combinator',
      year: 2007,
      genres: ['Technology', 'News', 'Startup'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: null,
    },
    {
      title: 'Product Hunt',
      description: 'A community-driven platform for discovering new products and startups.',
      imageUrl: 'https://assets.producthunt.com/assets/producthunt-white-838c655e.svg',
      category: 'WEBSITE',
      author: 'Product Hunt',
      year: 2013,
      genres: ['Technology', 'Startup', 'Products'],
      totalEpisodes: null,
      totalChapters: null,
      totalBooks: null,
    },
  ]

  // Create tracking items and user tracking records
  for (const item of trackingItems) {
    const trackingItem = await prisma.trackingItem.upsert({
      where: {
        title_category: {
          title: item.title,
          category: item.category as any,
        },
      },
      update: {},
      create: {
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        externalUrl: item.externalUrl,
        category: item.category as any,
        author: item.author,
        year: item.year,
        genres: item.genres,
        totalEpisodes: item.totalEpisodes,
        totalChapters: item.totalChapters,
        totalBooks: item.totalBooks,
      },
    })

    console.log(`✅ Created tracking item: ${trackingItem.title} (${trackingItem.category})`)

    // Create user tracking with random status
    const statuses = ['PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomRating = Math.random() > 0.3 ? Math.floor(Math.random() * 10) + 1 : null
    const randomProgress = trackingItem.totalEpisodes
      ? Math.floor(Math.random() * trackingItem.totalEpisodes) + 1
      : trackingItem.totalChapters
      ? Math.floor(Math.random() * trackingItem.totalChapters) + 1
      : trackingItem.totalBooks
      ? Math.floor(Math.random() * trackingItem.totalBooks) + 1
      : null

    await prisma.userTracking.upsert({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: trackingItem.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        itemId: trackingItem.id,
        status: randomStatus as any,
        rating: randomRating ? `ONE_${'ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,TEN'.split(',')[randomRating - 1]}` : null,
        progress: randomProgress,
        startDate: new Date('2024-01-01'),
        finishDate: randomStatus === 'COMPLETED' ? new Date() : null,
        priority: Math.floor(Math.random() * 5) + 1,
        isFavorite: Math.random() > 0.7,
      },
    })

    console.log(`  └─ Created user tracking: ${randomStatus}, rating: ${randomRating || 'N/A'}`)

    // Create activity log
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'added_to_list',
        itemTitle: trackingItem.title,
        category: trackingItem.category as any,
        details: `Added to ${randomStatus.toLowerCase()}`,
      },
    })
  }

  // Create some tracking notes
  const notes = [
    {
      itemId: trackingItems.find((i) => i.title === 'One Piece')?.id!,
      content: 'One of the best anime ever! The story just keeps getting better.',
    },
    {
      itemId: trackingItems.find((i) => i.title === 'Breaking Bad')?.id!,
      content: 'The character development in this show is incredible. Walter White\'s transformation is masterful.',
    },
    {
      itemId: trackingItems.find((i) => i.title === 'Dune')?.id!,
      content: 'Reading this before watching the movie. The world-building is phenomenal.',
    },
  ]

  for (const note of notes) {
    if (note.itemId) {
      await prisma.trackingNote.create({
        data: {
          userId: user.id,
          itemId: note.itemId,
          content: note.content,
          isPrivate: false,
        },
      })
      console.log(`✅ Created note for item ID: ${note.itemId}`)
    }
  }

  console.log('✨ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
