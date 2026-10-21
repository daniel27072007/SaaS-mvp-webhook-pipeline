//made those mock functions so the frontend of those parts need to talk to the backend some way

export const dashboardSummary = (req, res) => {
  try {
    const mockSummaryData = {
      overview: {
        totalUsers: 1250,
        activeSubscriptions: 450,
        monthlyRevenue: 15400.00,
        growthPercentage: 12.5
      },
      recentActivity: [
        { id: 1, action: "New user registered", time: "5 minutes ago" },
        { id: 2, action: "Premium subscription renewed", time: "25 minutes ago" },
        { id: 3, action: "System update completed", time: "1 hour ago" }
      ],
      systemStatus: {
        apiStatus: "operational",
        lastUpdate: new Date().toISOString()
      }
    };
    return res.status(200).json({
      success: true,
      message: "Dashboard summary data fetched successfully.",
      data: mockSummaryData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data.",
      error: error.message
    });
  }
};

export const analyticsReports = (req, res) => {
  try {
    // Simulating file metadata extraction from the request body or files
    const fileName = req.body.fileName || "uploaded_report.csv";
    const fileSize = req.body.fileSize || "1.2 MB";

    // Mock analytics chart data generated after "processing" the report
    const mockChartData = {
      meta: {
        processedFile: fileName,
        size: fileSize,
        processedAt: new Date().toISOString()
      },
      charts: {
        lineChart: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May"],
          datasets: [
            { label: "Sales Revenue", data: [4000, 4500, 5100, 4900, 6200] },
            { label: "Operating Costs", data: [2100, 2300, 2000, 2200, 2500] }
          ]
        },
        barChart: {
          categories: ["Product A", "Product B", "Product C"],
          values: [320, 450, 210]
        },
        pieChart: {
          segments: ["Organic Search", "Direct Traffic", "Paid Ads"],
          percentages: [45, 35, 20]
        }
      }
    };

    // Return status 201 (Created) or 200 (OK) with the chart payload
    return res.status(200).json({
      success: true,
      message: "File simulation successful. Chart data generated.",
      data: mockChartData
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process analytics report.",
      error: error.message
    });
  }
};

export const aiAdvisorInsights = (req, res) => {
  try {
    // Mock dataset representing high-value artificial intelligence insights
    const mockAiInsights = {
      meta: {
        generatedAt: new Date().toISOString(),
        modelUsed: "AI-Advisor-v4.2-Pro",
        confidenceScore: 0.98
      },
      summary: "Based on your financial data, your operation is highly efficient, but minor adjustments can yield a significant boost in operational profit next month.",
      insights: [
        {
          id: "insight_01",
          category: "Cost Optimization",
          priority: "HIGH",
          title: "Reduce Cloud Server Over-provisioning",
          description: "Your staging environments have been running at 15% capacity for the last 14 days. Downsizing these instances could reduce infrastructure costs by up to 22%.",
          estimatedSavings: "$450.00/month"
        },
        {
          id: "insight_02",
          category: "Revenue Growth",
          priority: "MEDIUM",
          title: "Untapped Premium Conversion Window",
          description: "Users who log in more than 5 times during their first week have an 80% higher conversion rate when offered a 10% discount on day 6.",
          estimatedImpact: "+8% Conversion Rate"
        },
        {
          id: "insight_03",
          category: "Risk Mitigation",
          priority: "LOW",
          title: "Subscription Churn Warning",
          description: "An unusual drop in API consumption was detected among 12 corporate clients, signaling potential subscription cancellation risks.",
          actionRequired: "Trigger customer success follow-up email sequence."
        }
      ]
    };

    // Return status 200 (OK) with the premium AI insights payload
    return res.status(200).json({
      success: true,
      message: "Premium AI insights generated successfully.",
      data: mockAiInsights
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI insights.",
      error: error.message
    });
  }
};