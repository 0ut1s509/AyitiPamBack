const RecentActivity = ({ submissions, factChecks, showAll = false }) => {
  const allActivities = [
    ...submissions.map(sub => ({
      type: 'submission',
      item: sub,
      date: sub.date_submitted,
      icon: '📋',
      color: 'blue'
    })),
    ...factChecks.map(fc => ({
      type: 'factcheck',
      item: fc,
      date: fc.date_created,
      icon: '📰',
      color: 'green'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date))
   .slice(0, showAll ? 20 : 5);

  const getActivityDescription = (activity) => {
    if (activity.type === 'submission') {
      return `You submitted a claim for verification`;
    } else {
      return `A fact-check related to your submission was published`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        <p className="text-sm text-gray-600">Your latest interactions with Ayiti Vérité</p>
      </div>

      <div className="divide-y divide-gray-200">
        {allActivities.map((activity, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-${activity.color}-100`}>
                <span className={`text-${activity.color}-600`}>{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {getActivityDescription(activity)}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.type === 'submission' 
                    ? activity.item.claim_text || activity.item.url_submitted
                    : activity.item.title
                  }
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allActivities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No recent activity
        </div>
      )}
    </div>
  );
};

export default RecentActivity;