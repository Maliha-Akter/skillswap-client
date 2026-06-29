// Dictionary definitions mirroring your lib/reviews.js logic
const RATING_VALUES = {
    'Excellent': 5,
    'Good': 4,
    'Average': 3,
    'Poor': 2,
    'Very Poor': 1
};

app.get("/api/top-freelancers", async (req, res) => {
    console.log("\n🚀 [BACKEND DIAGNOSTIC] Incoming request to compile Top Rated Freelancers...");
    try {
        // 1. Fetch Freelancer list records
        const freelancersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/freelancers`);
        if (!freelancersResponse.ok) {
            console.error("❌ [BACKEND DIAGNOSTIC] Failed fetching basic user node list.");
            return res.status(500).json({ error: "Failed to collect core freelancer profiles registry." });
        }
        const freelancers = await freelancersResponse.json();
        console.log(`📦 [BACKEND DIAGNOSTIC] Loaded ${freelancers.length} freelancers out of database.`);

        // 2. Concurrently fetch matching profile reviews to process ratings calculation maps
        const computedFreelancers = await Promise.all(
            freelancers.map(async (freelancer) => {
                let matchingReviews = [];
                const targetEmail = freelancer.email?.trim().toLowerCase();
                
                try {
                    // Pull direct reviews for this email node link
                    const reviewResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/freelancer-reviews?email=${encodeURIComponent(freelancer.email)}`);
                    if (reviewResponse.ok) {
                        matchingReviews = await reviewResponse.json();
                    }
                } catch (err) {
                    console.warn(`⚠️ [BACKEND DIAGNOSTIC] Problem querying review maps for ${freelancer.email}:`, err.message);
                }

                // Apply calculation rating logic matching your rules helper
                let averageScore = 0;
                if (matchingReviews && matchingReviews.length > 0) {
                    const totalScore = matchingReviews.reduce((sum, rev) => {
                        const score = RATING_VALUES[rev.rating] || 0;
                        return sum + score;
                    }, 0);

                    averageScore = parseFloat((totalScore / matchingReviews.length).toFixed(1));
                }

                console.log(`📊 [BACKEND DIAGNOSTIC] Freelancer: ${freelancer.name} (${freelancer.email}) | Reviews Count: ${matchingReviews.length} | Computed AvgRating: ${averageScore}`);

                return {
                    ...freelancer,
                    avgRating: averageScore
                };
            })
        );

        // 3. Sort down by higher rating matrix and take only top 3 elements
        const topThree = computedFreelancers
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 3);

        console.log("🏆 [BACKEND DIAGNOSTIC] Successfully ranked and calculated Top 3 records:", topThree.map(f => ({ name: f.name, avgRating: f.avgRating })));
        
        res.json(topThree);

    } catch (error) {
        console.error("❌ [BACKEND DIAGNOSTIC] Global fatal process exception:", error);
        res.status(500).json({ error: "Internal processing error collecting talent rankings." });
    }
});