import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { ReturnResponse } from "@/lib/returnResponse";
import { Usertype } from "@/generated/prisma";

interface DashboardStats {
  overview: {
    totalProperties: number;
    totalUsers: number;
    totalAgents: number;
    totalDevelopers: number;
    totalAreas: number;
    totalCommunities: number;
    totalCollections: number;
    totalRequestTours: number;
    totalPropertyContacts: number;
    totalContacts: number;
    totalSellings: number;
    totalAgentQueries: number;
  };
  properties: {
    byStatus: Array<{ status: string; count: number }>;
    byType: Array<{ type: string; count: number }>;
    featured: number;
    drafts: number;
    published: number;
    recentlyAdded: number; // Last 30 days
  };
  users: {
    byRole: Array<{ role: string; count: number }>;
    verified: number;
    unverified: number;
    recentRegistrations: number; // Last 30 days
  };
  agents: {
    total: number;
    verified: number;
    unverified: number;
    withProperties: number;
    recentlyJoined: number; // Last 30 days
  };
  interactions: {
    totalTours: number;
    recentTours: number; // Last 30 days
    toursByMode: Array<{ mode: string; count: number }>;
    totalCollections: number;
    recentCollections: number; // Last 30 days
    propertyContacts: number;
    recentPropertyContacts: number; // Last 30 days
  };
  sellings: {
    total: number;
    byStatus: Array<{ status: string; count: number }>;
    recentSellings: number; // Last 30 days
  };
  revenue: {
    totalPropertiesValue: number;
    averagePropertyPrice: number;
    highestPrice: number;
    lowestPrice: number;
  };
  growth: {
    propertiesGrowth: number; // Percentage growth compared to previous month
    usersGrowth: number;
    toursGrowth: number;
    sellingsGrowth: number;
  };
}

export const getStats = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole || !userId) {
      return ReturnResponse.error(res, {
        message: "Unauthorized access",
        statusCode: 401,
      });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Base where conditions for filtering data based on user role
    const getPropertyWhereCondition = () => {
      if (userRole === Usertype.ADMIN) {
        return {}; // Admin can see all properties
      } else {
        return { userId }; // Agent can only see their own properties
      }
    };

    const getUserWhereCondition = () => {
      if (userRole === Usertype.ADMIN) {
        return {}; // Admin can see all users
      } else {
        return { id: userId }; // Agent can only see their own data
      }
    };

    // Get overview statistics
    const [
      totalProperties,
      totalUsers,
      totalAgents,
      totalDevelopers,
      totalAreas,
      totalCommunities,
      totalCollections,
      totalRequestTours,
      totalPropertyContacts,
      totalContacts,
      totalSellings,
      totalAgentQueries
    ] = await Promise.all([
      prisma.property.count({ where: getPropertyWhereCondition() }),
      userRole === Usertype.ADMIN ? prisma.user.count() : 1, // Agent only counts themselves
      userRole === Usertype.ADMIN ? prisma.user.count({ where: { role: Usertype.AGENT } }) : 0,
      userRole === Usertype.ADMIN ? prisma.developer.count() : 0,
      userRole === Usertype.ADMIN ? prisma.area.count() : 0,
      userRole === Usertype.ADMIN ? prisma.community.count() : 0,
      userRole === Usertype.ADMIN 
        ? prisma.collection.count() 
        : prisma.collection.count({ 
            where: { 
              properties: { userId } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.requestTour.count() 
        : prisma.requestTour.count({ 
            where: { 
              property: { userId } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.propertyContact.count() 
        : prisma.propertyContact.count({ 
            where: { 
              property: { userId } 
            } 
          }),
      userRole === Usertype.ADMIN ? prisma.contact.count() : 0,
      userRole === Usertype.ADMIN 
        ? prisma.selling.count() 
        : prisma.selling.count({ where: { agentId: userId } }),
      userRole === Usertype.ADMIN ? prisma.agentQuery.count() : 0,
    ]);

    // Get properties by status
    const propertiesByStatus = await prisma.property.groupBy({
      by: ['status'],
      where: getPropertyWhereCondition(),
      _count: {
        status: true,
      },
    });

    // Get properties by type
    const propertiesByType = await prisma.property.groupBy({
      by: ['type'],
      where: getPropertyWhereCondition(),
      _count: {
        type: true,
      },
    });

    // Get featured and draft properties
    const [featuredProperties, draftProperties, publishedProperties, recentProperties] = await Promise.all([
      prisma.property.count({ 
        where: { ...getPropertyWhereCondition(), isFeatured: true } 
      }),
      prisma.property.count({ 
        where: { ...getPropertyWhereCondition(), isDraft: true } 
      }),
      prisma.property.count({ 
        where: { ...getPropertyWhereCondition(), isDraft: false } 
      }),
      prisma.property.count({ 
        where: { 
          ...getPropertyWhereCondition(), 
          createdAt: { gte: thirtyDaysAgo } 
        } 
      }),
    ]);

    // Get users by role (Admin only)
    const usersByRole = userRole === Usertype.ADMIN 
      ? await prisma.user.groupBy({
          by: ['role'],
          _count: {
            role: true,
          },
        })
      : [];

    // Get verified/unverified users
    const [verifiedUsers, unverifiedUsers, recentUsers] = await Promise.all([
      userRole === Usertype.ADMIN 
        ? prisma.user.count({ where: { isVerified: true } })
        : req.user?.role === "AGENT" && req.user?.agentId ? 1 : 0,
      userRole === Usertype.ADMIN 
        ? prisma.user.count({ where: { isVerified: false } })
        : 0,
      userRole === Usertype.ADMIN 
        ? prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : 0,
    ]);

    // Get agent statistics (Admin only)
    const [verifiedAgents, unverifiedAgents, agentsWithProperties, recentAgents] = userRole === Usertype.ADMIN 
      ? await Promise.all([
          prisma.user.count({ 
            where: { role: Usertype.AGENT, isVerified: true } 
          }),
          prisma.user.count({ 
            where: { role: Usertype.AGENT, isVerified: false } 
          }),
          prisma.user.count({ 
            where: { 
              role: Usertype.AGENT, 
              property: { 
                some: {} 
              } 
            } 
          }),
          prisma.user.count({ 
            where: { 
              role: Usertype.AGENT, 
              createdAt: { gte: thirtyDaysAgo } 
            } 
          }),
        ])
      : [0, 0, 0, 0];

    // Get interaction statistics
    const [recentTours, toursByMode, recentCollections, recentPropertyContacts] = await Promise.all([
      userRole === Usertype.ADMIN 
        ? prisma.requestTour.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : prisma.requestTour.count({ 
            where: { 
              property: { userId }, 
              createdAt: { gte: thirtyDaysAgo } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.requestTour.groupBy({
            by: ['mode'],
            _count: {
              mode: true,
            },
          })
        : prisma.requestTour.groupBy({
            by: ['mode'],
            where: { property: { userId } },
            _count: {
              mode: true,
            },
          }),
      userRole === Usertype.ADMIN 
        ? prisma.collection.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : prisma.collection.count({ 
            where: { 
              properties: { userId }, 
              createdAt: { gte: thirtyDaysAgo } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.propertyContact.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : prisma.propertyContact.count({ 
            where: { 
              property: { userId }, 
              createdAt: { gte: thirtyDaysAgo } 
            } 
          }),
    ]);

    // Get selling statistics
    const [sellingsByStatus, recentSellings] = await Promise.all([
      userRole === Usertype.ADMIN 
        ? prisma.selling.groupBy({
            by: ['status'],
            _count: {
              status: true,
            },
          })
        : prisma.selling.groupBy({
            by: ['status'],
            where: { agentId: userId },
            _count: {
              status: true,
            },
          }),
      userRole === Usertype.ADMIN 
        ? prisma.selling.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        : prisma.selling.count({ 
            where: { 
              agentId: userId, 
              createdAt: { gte: thirtyDaysAgo } 
            } 
          }),
    ]);

    // Get revenue statistics
    const revenueStats = await prisma.property.aggregate({
      where: getPropertyWhereCondition(),
      _sum: {
        price: true,
      },
      _avg: {
        price: true,
      },
      _max: {
        price: true,
      },
      _min: {
        price: true,
      },
    });

    // Get growth statistics (comparing current month to previous month)
    const [
      currentMonthProperties,
      previousMonthProperties,
      currentMonthUsers,
      previousMonthUsers,
      currentMonthTours,
      previousMonthTours,
      currentMonthSellings,
      previousMonthSellings,
    ] = await Promise.all([
      prisma.property.count({ 
        where: { 
          ...getPropertyWhereCondition(), 
          createdAt: { gte: currentMonth } 
        } 
      }),
      prisma.property.count({ 
        where: { 
          ...getPropertyWhereCondition(), 
          createdAt: { 
            gte: previousMonth, 
            lt: currentMonth 
          } 
        } 
      }),
      userRole === Usertype.ADMIN 
        ? prisma.user.count({ where: { createdAt: { gte: currentMonth } } })
        : 0,
      userRole === Usertype.ADMIN 
        ? prisma.user.count({ 
            where: { 
              createdAt: { 
                gte: previousMonth, 
                lt: currentMonth 
              } 
            } 
          })
        : 0,
      userRole === Usertype.ADMIN 
        ? prisma.requestTour.count({ where: { createdAt: { gte: currentMonth } } })
        : prisma.requestTour.count({ 
            where: { 
              property: { userId }, 
              createdAt: { gte: currentMonth } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.requestTour.count({ 
            where: { 
              createdAt: { 
                gte: previousMonth, 
                lt: currentMonth 
              } 
            } 
          })
        : prisma.requestTour.count({ 
            where: { 
              property: { userId }, 
              createdAt: { 
                gte: previousMonth, 
                lt: currentMonth 
              } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.selling.count({ where: { createdAt: { gte: currentMonth } } })
        : prisma.selling.count({ 
            where: { 
              agentId: userId, 
              createdAt: { gte: currentMonth } 
            } 
          }),
      userRole === Usertype.ADMIN 
        ? prisma.selling.count({ 
            where: { 
              createdAt: { 
                gte: previousMonth, 
                lt: currentMonth 
              } 
            } 
          })
        : prisma.selling.count({ 
            where: { 
              agentId: userId, 
              createdAt: { 
                gte: previousMonth, 
                lt: currentMonth 
              } 
            } 
          }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const stats: DashboardStats = {
      overview: {
        totalProperties,
        totalUsers,
        totalAgents,
        totalDevelopers,
        totalAreas,
        totalCommunities,
        totalCollections,
        totalRequestTours,
        totalPropertyContacts,
        totalContacts,
        totalSellings,
        totalAgentQueries,
      },
      properties: {
        byStatus: propertiesByStatus.map(item => ({
          status: item.status,
          count: item._count.status,
        })),
        byType: propertiesByType.map(item => ({
          type: item.type,
          count: item._count.type,
        })),
        featured: featuredProperties,
        drafts: draftProperties,
        published: publishedProperties,
        recentlyAdded: recentProperties,
      },
      users: {
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.role,
        })),
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        recentRegistrations: recentUsers,
      },
      agents: {
        total: totalAgents,
        verified: verifiedAgents,
        unverified: unverifiedAgents,
        withProperties: agentsWithProperties,
        recentlyJoined: recentAgents,
      },
      interactions: {
        totalTours: totalRequestTours,
        recentTours,
        toursByMode: toursByMode.map(item => ({
          mode: item.mode,
          count: item._count.mode,
        })),
        totalCollections,
        recentCollections,
        propertyContacts: totalPropertyContacts,
        recentPropertyContacts,
      },
      sellings: {
        total: totalSellings,
        byStatus: sellingsByStatus.map(item => ({
          status: item.status,
          count: item._count.status,
        })),
        recentSellings,
      },
      revenue: {
        totalPropertiesValue: revenueStats._sum.price || 0,
        averagePropertyPrice: revenueStats._avg.price || 0,
        highestPrice: revenueStats._max.price || 0,
        lowestPrice: revenueStats._min.price || 0,
      },
      growth: {
        propertiesGrowth: calculateGrowth(currentMonthProperties, previousMonthProperties),
        usersGrowth: calculateGrowth(currentMonthUsers, previousMonthUsers),
        toursGrowth: calculateGrowth(currentMonthTours, previousMonthTours),
        sellingsGrowth: calculateGrowth(currentMonthSellings, previousMonthSellings),
      },
    };

    return ReturnResponse.success(res, {
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });

  } catch (error: any) {
    console.error("Error getting dashboard stats:", error);
    return ReturnResponse.error(res, {
      message: "Failed to retrieve dashboard statistics",
      error: error.message,
      statusCode: 500,
    });
  }
};

// Get property performance statistics
export const getPropertyPerformance = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole || !userId) {
      return ReturnResponse.error(res, {
        message: "Unauthorized access",
        statusCode: 401,
      });
    }

    const getPropertyWhereCondition = () => {
      if (userRole === Usertype.ADMIN) {
        return {};
      } else {
        return { userId };
      }
    };

    // Get properties with their interaction counts
    const properties = await prisma.property.findMany({
      where: getPropertyWhereCondition(),
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        status: true,
        isFeatured: true,
        createdAt: true,
        _count: {
          select: {
            collection: true,
            requestTour: true,
            propertyContacts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20, // Top 20 properties
    });

    // Calculate performance metrics for each property
    const propertyPerformance = properties.map(property => {
      const totalInteractions = 
        property._count.collection + 
        property._count.requestTour + 
        property._count.propertyContacts;

      return {
        id: property.id,
        name: property.name,
        price: property.price,
        type: property.type,
        status: property.status,
        isFeatured: property.isFeatured,
        createdAt: property.createdAt,
        interactions: {
          collections: property._count.collection,
          tours: property._count.requestTour,
          contacts: property._count.propertyContacts,
          total: totalInteractions,
        },
        performanceScore: totalInteractions, // Simple score based on total interactions
      };
    });

    // Sort by performance score
    propertyPerformance.sort((a, b) => b.performanceScore - a.performanceScore);

    return ReturnResponse.success(res, {
      message: "Property performance statistics retrieved successfully",
      data: propertyPerformance,
    });

  } catch (error: any) {
    console.error("Error getting property performance:", error);
    return ReturnResponse.error(res, {
      message: "Failed to retrieve property performance statistics",
      error: error.message,
      statusCode: 500,
    });
  }
};

// Get recent activities
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole || !userId) {
      return ReturnResponse.error(res, {
        message: "Unauthorized access",
        statusCode: 401,
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;

    let activities: any[] = [];

    if (userRole === Usertype.ADMIN) {
      // Admin can see all activities
      const [properties, users, tours, contacts, sellings] = await Promise.all([
        prisma.property.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.requestTour.findMany({
          select: {
            id: true,
            name: true,
            mode: true,
            createdAt: true,
            property: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.propertyContact.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
            property: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.selling.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      // Format activities
      activities = [
        ...properties.map(p => ({
          type: 'property_added',
          id: p.id,
          title: `New property ${p.name} added`,
          subtitle: `by ${p.user?.name || 'Unknown'}`,
          timestamp: p.createdAt,
        })),
        ...users.map(u => ({
          type: 'user_registered',
          id: u.id,
          title: `New ${u.role.toLowerCase()} registered`,
          subtitle: u.name,
          timestamp: u.createdAt,
        })),
        ...tours.map(t => ({
          type: 'tour_requested',
          id: t.id,
          title: `Tour requested for ${t.property.name}`,
          subtitle: `${t.mode} tour by ${t.name}`,
          timestamp: t.createdAt,
        })),
        ...contacts.map(c => ({
          type: 'property_contact',
          id: c.id,
          title: `Contact inquiry for ${c.property.name}`,
          subtitle: `by ${c.name}`,
          timestamp: c.createdAt,
        })),
        ...sellings.map(s => ({
          type: 'selling_inquiry',
          id: s.id,
          title: `Selling inquiry from ${s.name}`,
          subtitle: `Status: ${s.status}`,
          timestamp: s.createdAt,
        })),
      ];
    } else {
      // Agent can only see their own activities
      const [properties, tours, contacts, sellings] = await Promise.all([
        prisma.property.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 15,
        }),
        prisma.requestTour.findMany({
          where: { property: { userId } },
          select: {
            id: true,
            name: true,
            mode: true,
            createdAt: true,
            property: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 15,
        }),
        prisma.propertyContact.findMany({
          where: { property: { userId } },
          select: {
            id: true,
            name: true,
            createdAt: true,
            property: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 15,
        }),
        prisma.selling.findMany({
          where: { agentId: userId },
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 15,
        }),
      ]);

      activities = [
        ...properties.map(p => ({
          type: 'property_added',
          id: p.id,
          title: `You added property ${p.name}`,
          subtitle: 'Property successfully created',
          timestamp: p.createdAt,
        })),
        ...tours.map(t => ({
          type: 'tour_requested',
          id: t.id,
          title: `Tour requested for your property ${t.property.name}`,
          subtitle: `${t.mode} tour by ${t.name}`,
          timestamp: t.createdAt,
        })),
        ...contacts.map(c => ({
          type: 'property_contact',
          id: c.id,
          title: `Contact inquiry for your property ${c.property.name}`,
          subtitle: `by ${c.name}`,
          timestamp: c.createdAt,
        })),
        ...sellings.map(s => ({
          type: 'selling_inquiry',
          id: s.id,
          title: `Selling inquiry assigned to you`,
          subtitle: `${s.name} - Status: ${s.status}`,
          timestamp: s.createdAt,
        })),
      ];
    }

    // Sort all activities by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    activities = activities.slice(0, limit);

    return ReturnResponse.success(res, {
      message: "Recent activities retrieved successfully",
      data: activities,
    });

  } catch (error: any) {
    console.error("Error getting recent activities:", error);
    return ReturnResponse.error(res, {
      message: "Failed to retrieve recent activities",
      error: error.message,
      statusCode: 500,
    });
  }
};

// Get analytics data for charts
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (!userRole || !userId) {
      return ReturnResponse.error(res, {
        message: "Unauthorized access",
        statusCode: 401,
      });
    }

    const period = req.query.period as string || '30'; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const getPropertyWhereCondition = () => {
      if (userRole === Usertype.ADMIN) {
        return {};
      } else {
        return { userId };
      }
    };

    // Generate date range for the last N days
    const dateRange = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateRange.push(date.toISOString().split('T')[0]);
    }

    // Get daily property additions
    const dailyProperties = await prisma.property.groupBy({
      by: ['createdAt'],
      where: {
        ...getPropertyWhereCondition(),
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Get daily user registrations (Admin only)
    const dailyUsers = userRole === Usertype.ADMIN 
      ? await prisma.user.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
        })
      : [];

    // Get daily tours
    const dailyTours = userRole === Usertype.ADMIN
      ? await prisma.requestTour.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
        })
      : await prisma.requestTour.groupBy({
          by: ['createdAt'],
          where: {
            property: { userId },
            createdAt: {
              gte: startDate,
            },
          },
          _count: {
            id: true,
          },
        });

    // Format data for charts
    const formatDailyData = (data: any[], dateRange: string[]) => {
      const dataMap = new Map();
      data.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        dataMap.set(date, item._count.id);
      });

      return dateRange.map(date => ({
        date,
        count: dataMap.get(date) || 0,
      }));
    };

    const analytics = {
      propertyTrends: formatDailyData(dailyProperties, dateRange),
      userTrends: formatDailyData(dailyUsers, dateRange),
      tourTrends: formatDailyData(dailyTours, dateRange),
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    };

    return ReturnResponse.success(res, {
      message: "Analytics data retrieved successfully",
      data: analytics,
    });

  } catch (error: any) {
    console.error("Error getting analytics:", error);
    return ReturnResponse.error(res, {
      message: "Failed to retrieve analytics data",
      error: error.message,
      statusCode: 500,
    });
  }
};