import React from "react";

const UserStatsModal = ({ showModal, setShowModal, userStats }) => {
    if (!showModal) return null;
    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                <h2>User Expense Statistics</h2>

                {userStats.message ? (
                    <p className="no-data-message">{userStats.message}</p>
                ) : userStats.length === 0 ? (
                    <p className="no-data-message">No user expenses available</p>
                ) : (
                    <div className="table-container">
                        <table className="stats-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Top 3 Spending Days Expenditure</th>
                                    <th>Monthly Change Expenditure</th>
                                    <th>Predicted Next Month's Expenditure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userStats.map(({ user, topDays, monthlyChange, nextMonthPrediction }) => (
                                    <tr key={user.id}>
                                        <td>{user.name}</td>
                                        <td>
                                            {topDays.length > 0 ? (
                                                <ul>
                                                    {topDays.map((d, index) => (
                                                        <li key={index}>
                                                            {new Date(d.date).toLocaleDateString("en-GB")} - ₹{parseFloat(d.total_spent).toLocaleString()}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="no-data">No spending data available</span>
                                            )}
                                        </td>
                                        <td>
                                            {monthlyChange ? (
                                                <>
                                                    <p>Prev: ₹{parseFloat(monthlyChange.prev_month).toLocaleString()}</p>
                                                    <p>Current: ₹{parseFloat(monthlyChange.current_month).toLocaleString()}</p>
                                                    <p>Change: {monthlyChange.percentage_change ? `${parseFloat(monthlyChange.percentage_change).toFixed(2)}%` : "N/A"}</p>
                                                </>
                                            ) : (
                                                <span className="no-data">No data</span>
                                            )}
                                        </td>
                                        <td>
                                            {nextMonthPrediction?.predicted_next_month
                                                ? `₹${parseFloat(nextMonthPrediction.predicted_next_month).toLocaleString()}`
                                                : <span className="no-data">No prediction available</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserStatsModal;
