import React, { useState, useMemo } from "react";
import "./LowCal.css";
import lowcaldata from "./lowcaldata.json";

const LowCal = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [maxCalories, setMaxCalories] = useState("");
  const [minProtein, setMinProtein] = useState("");
  const [minFiber, setMinFiber] = useState("");
  const [expandedFood, setExpandedFood] = useState(null);
  const [portions, setPortions] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Filtered foods
  const filteredFoods = useMemo(() => {
    return lowcaldata.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || food.category === categoryFilter;
      const matchesCalories = maxCalories === "" || food.calories_kcal <= Number(maxCalories);
      const matchesProtein = minProtein === "" || food.protein_g >= Number(minProtein);
      const matchesFiber = minFiber === "" || food.fiber_g >= Number(minFiber);
      return matchesSearch && matchesCategory && matchesCalories && matchesProtein && matchesFiber;
    });
  }, [search, categoryFilter, maxCalories, minProtein, minFiber]);

  // Sorting
  const sortedFoods = useMemo(() => {
    if (!sortConfig.key) return filteredFoods;
    const sorted = [...filteredFoods].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredFoods, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const getPortionedNutrients = (food) => {
    const portion = portions[food.name] || 100;
    const factor = portion / 100;
    return {
      calories: (food.calories_kcal * factor).toFixed(1),
      protein: (food.protein_g * factor).toFixed(1),
      carbs: (food.carbohydrates_g * factor).toFixed(1),
      fiber: (food.fiber_g * factor).toFixed(1),
      fat: (food.fat_g * factor).toFixed(1),
    };
  };

  const handlePortionChange = (foodName, value) => setPortions((prev) => ({ ...prev, [foodName]: Number(value) || 100 }));
  const handleQuickPortion = (foodName, value) => setPortions((prev) => ({ ...prev, [foodName]: value }));

  const toggleAccordion = (foodName) => setExpandedFood(expandedFood === foodName ? null : foodName);

  const clearFilters = () => {
    setSearch(""); setCategoryFilter("All"); setMaxCalories(""); setMinProtein(""); setMinFiber("");
  };

  const getBadgeColor = (category) => {
    switch (category) {
      case "Fruit": return "badge-fruit";
      case "Vegetable": return "badge-vegetable";
      case "Protein": return "badge-protein";
      default: return "";
    }
  };

  const getSortArrow = (key) => {
    if (sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  return (
    <div className="nutrition-app">
      <header className="app-header"><h1>Weight Loss Food Explorer</h1></header>

      {/* Filters */}
      <section className="filters sticky">
        <input placeholder="Search food..." value={search} onChange={(e)=>setSearch(e.target.value)} />
        <select value={categoryFilter} onChange={(e)=>setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Fruit">Fruit</option>
          <option value="Vegetable">Vegetable</option>
          <option value="Protein">Protein</option>
        </select>
        <input type="number" placeholder="Max Calories" value={maxCalories} onChange={(e)=>setMaxCalories(e.target.value)} />
        <input type="number" placeholder="Min Protein" value={minProtein} onChange={(e)=>setMinProtein(e.target.value)} />
        <input type="number" placeholder="Min Fiber" value={minFiber} onChange={(e)=>setMinFiber(e.target.value)} />
        <button className="reset-button" onClick={clearFilters}>Reset Filters</button>
      </section>

      <section className="food-table">
        <table>
          <thead className="sticky-header">
            <tr>
              <th style={{textAlign:"left"}} onClick={()=>requestSort("name")}>Name {getSortArrow("name")}</th>
              <th onClick={()=>requestSort("category")}>Category {getSortArrow("category")}</th>
              <th onClick={()=>requestSort("calories_kcal")}>Calories {getSortArrow("calories_kcal")}</th>
              <th onClick={()=>requestSort("protein_g")}>Protein {getSortArrow("protein_g")}</th>
              <th onClick={()=>requestSort("fiber_g")}>Fiber {getSortArrow("fiber_g")}</th>
            </tr>
          </thead>
          <tbody>
            {sortedFoods.length===0?(
              <tr><td colSpan="5">No foods found.</td></tr>
            ):(
              sortedFoods.map(food=>{
                const isExpanded = expandedFood===food.name;
                const nutrients = getPortionedNutrients(food);
                return(
                  <React.Fragment key={food.name}>
                    <tr className={isExpanded?"selected":""} onClick={()=>toggleAccordion(food.name)}>
                      <td style={{textAlign:"left"}}>{food.name}</td>
                      <td><span className={`badge ${getBadgeColor(food.category)}`}>{food.category}</span></td>
                      <td>{food.calories_kcal}</td>
                      <td>{food.protein_g}</td>
                      <td>{food.fiber_g}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="accordion-row">
                        <td colSpan="5">
                          <div className="food-details-accordion">
                            <div className="nutrients">
                              <p><strong>Nutrition for 100 g</strong></p>
                              <p><strong>Calories:</strong> {food.calories_kcal} kcal</p>
                              <p><strong>Protein:</strong> {food.protein_g} g</p>
                              <p><strong>Carbs:</strong> {food.carbohydrates_g} g</p>
                              <p><strong>Fiber:</strong> {food.fiber_g} g</p>
                              <p><strong>Fat:</strong> {food.fat_g} g</p>
                              <p><strong>Micronutrients:</strong> {food.micronutrients.join(", ")}</p>
                            </div>
                            <div className="portion-selector">
                              <h4>Portion (grams)</h4>
                              <div className="portion-buttons">
                                {[50,100,150,200,500].map(val=>(
                                  <button key={val} onClick={(e)=>{e.stopPropagation(); handleQuickPortion(food.name,val);}}
                                    className={portions[food.name]===val?"active":""}>{val} g</button>
                                ))}
                              </div>
                              <input type="number" min="1" value={portions[food.name]||100}
                                onChange={(e)=>handlePortionChange(food.name,e.target.value)}
                                onClick={(e)=>e.stopPropagation()} />
                            </div>
                            <div className="dynamic-nutrition">
                              <p><strong>Nutrition for {portions[food.name]||100} g</strong></p>
                              <p><strong>Calories:</strong> {nutrients.calories} kcal</p>
                              <p><strong>Protein:</strong> {nutrients.protein} g</p>
                              <p><strong>Carbs:</strong> {nutrients.carbs} g</p>
                              <p><strong>Fiber:</strong> {nutrients.fiber} g</p>
                              <p><strong>Fat:</strong> {nutrients.fat} g</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
};

export default LowCal;