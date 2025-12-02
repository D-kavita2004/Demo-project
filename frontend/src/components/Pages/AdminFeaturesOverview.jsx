import React from 'react'
import { cards } from '../Constants/DefaultData';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const AdminFeaturesOverview = () => {
  const navigate = useNavigate();
  return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card
                key={card.id}
                className="cursor-pointer transform hover:scale-[1.03] transition-all duration-300 shadow-sm hover:shadow-xl backdrop-blur-sm"
                onClick={() => navigate(card.route)}
              >
                <CardHeader className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-4 rounded-full bg-gradient-to-br ${card.color} shadow-md`}
                    >
                      {card.icon}
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-semibold">
                      {card.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Click to manage {card.title.toLowerCase()} efficiently.
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
  )
}

export default AdminFeaturesOverview