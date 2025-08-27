import React, { useState, useEffect } from "react";
import { getApiUrl, getAuthHeaders, API_ENDPOINTS } from "../config/api";
import { useAuth } from "../utils/auth";

const TokenTransactions = ({ compact = false, limit = 5 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchTransactions();
    } else {
      setLoading(false);
      setError("Giriş yapmanız gerekiyor");
    }
  }, [token]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl(API_ENDPOINTS.tokenTransactions), {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Oturum süreniz dolmuş, lütfen tekrar giriş yapın");
        } else if (response.status === 404) {
          setError("İşlem geçmişi bulunamadı");
        } else {
          setError("İşlem geçmişi alınamadı");
        }
        return;
      }

      const data = await response.json();

      if (data.status === "success") {
        setTransactions(data.data.transactions);
      } else {
        setError(data.message || "İşlem geçmişi alınamadı");
      }
    } catch (err) {
      console.error("Transactions fetch error:", err);
      setError("Bağlantı hatası - lütfen daha sonra tekrar deneyin");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800";
      case "usage":
        return "bg-red-100 text-red-800";
      case "refund":
        return "bg-blue-100 text-blue-800";
      case "bonus":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "purchase":
        return "Satın Alma";
      case "usage":
        return "Kullanım";
      case "refund":
        return "İade";
      case "bonus":
        return "Bonus";
      default:
        return type;
    }
  };

  const getAmountDisplay = (type, amount) => {
    if (type === "usage") {
      return `-${amount}`;
    }
    return `+${amount}`;
  };

  if (loading) {
    return (
      <div className={compact ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={compact ? "" : "bg-white rounded-lg shadow-md p-6"}>
        <div className="text-red-600 text-center">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const displayTransactions = compact
    ? transactions.slice(0, limit)
    : transactions;

  if (compact) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">
          Son İşlemler
        </h3>

        {transactions.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-400 text-2xl mb-2">📊</div>
            <p className="text-gray-500 text-xs">Henüz işlem yok</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${getTransactionTypeColor(
                      transaction.transaction_type
                    )}`}
                  >
                    {getTransactionTypeText(transaction.transaction_type)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">
                      {transaction.description || "Token işlemi"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString(
                        "tr-TR"
                      )}
                    </p>
                  </div>
                </div>

                <div
                  className={`text-sm font-semibold ${
                    transaction.transaction_type === "usage"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {getAmountDisplay(
                    transaction.transaction_type,
                    transaction.amount
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Token İşlem Geçmişi
      </h3>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <p className="text-gray-500">Henüz token işlemi bulunmuyor</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                    transaction.transaction_type
                  )}`}
                >
                  {getTransactionTypeText(transaction.transaction_type)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {transaction.description || "Token işlemi"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>

              <div
                className={`text-lg font-semibold ${
                  transaction.transaction_type === "usage"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {getAmountDisplay(
                  transaction.transaction_type,
                  transaction.amount
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Toplam {transactions.length} işlem
      </div>
    </div>
  );
};

export default TokenTransactions;
