const DashboardStats = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Submissions',
            value: stats.total_submissions,
            color: 'blue',
            icon: '📋'
        },
        {
            title: 'In Review',
            value: stats.submissions_in_review,
            color: 'yellow',
            icon: '⏳'
        },
        {
            title: 'Completed',
            value: stats.submissions_completed,
            color: 'green',
            icon: '✅'
        },
        {
            title: 'Published',
            value: stats.submissions_published,
            color: 'purple',
            icon: '📰'
        },
        {
            title: 'Need Verdicts',
            value: stats.submissions?.filter(s => s.status === 'in_review').length,
            color: 'orange',
            icon: '⚖️',
            link: '/admin?tab=submissions&status=in_review'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="text-2xl mr-4">{card.icon}</div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                </div>
            ))}

            {/* Completion Rate Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                    <div className="text-2xl mr-4">📊</div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.completion_rate}%</p>
                    </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.completion_rate}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;