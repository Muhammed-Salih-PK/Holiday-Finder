import React, { useEffect, useState } from "react";
import axios from "axios";


const Home = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("NL");
  const [holidays, setHolidays] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1); // For keyboard navigation

  useEffect(() => {
    axios
      .get("https://openholidaysapi.org/Countries?languageIsoCode=EN")
      .then((response) => {
        const formattedCountries = response.data.map((country) => ({
          isoCode: country.isoCode,
          name: country.name.find((n) => n.language === "EN")?.text || country.isoCode,
        }));
        setCountries(formattedCountries);
        setFilteredCountries(formattedCountries);
      })
      .catch((error) => console.error("Error fetching countries:", error));
  }, []);

  useEffect(() => {
    axios
      .get(`https://openholidaysapi.org/PublicHolidays?countryIsoCode=${selectedCountry}&validFrom=2025-01-01&validTo=2025-12-31&languageIsoCode=EN`)
      .then((response) => {
        const formattedHolidays = response.data.map((holiday) => {
          const holidayDate = new Date(holiday.startDate);
          return {
            date: holiday.startDate,
            name: holiday.name.find((n) => n.language === "EN")?.text || "Unknown Holiday",
            isSunday: holidayDate.getDay() === 0, // Check if it's a Sunday
          };
        });
        setHolidays(formattedHolidays);
      })
      .catch((error) => console.error("Error fetching holidays:", error));
  }, [selectedCountry]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = countries.filter((country) =>
      country.name.toLowerCase().includes(value)
    );
    setFilteredCountries(filtered.length > 0 ? filtered : []);
    setActiveIndex(-1); // Reset index when typing
  };

  const handleCountrySelect = (isoCode) => {
    setSelectedCountry(isoCode);
    setSearchTerm("");
    setFilteredCountries([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (filteredCountries.length > 0) {
      if (event.key === "ArrowDown") {
        setActiveIndex((prev) => (prev < filteredCountries.length - 1 ? prev + 1 : prev));
      } else if (event.key === "ArrowUp") {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (event.key === "Enter" && activeIndex >= 0) {
        handleCountrySelect(filteredCountries[activeIndex].isoCode);
      }
    }
  };

  return (
    <div className="container">
      <h1>Public Holidays Of {countries.find((c) => c.isoCode === selectedCountry)?.name}</h1>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a country..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleKeyDown} // Listen for key presses
        />
        {searchTerm && (
          <ul className="search-results">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country, index) => (
                <li
                  key={country.isoCode}
                  onClick={() => handleCountrySelect(country.isoCode)}
                  className={activeIndex === index ? "active" : ""}
                >
                  {country.name}
                </li>
              ))
            ) : (
              <li className="no-result">Country not found</li>
            )}
          </ul>
        )}
      </div>

      {/* Holiday List */}
      <div className="holiday-grid">
        {holidays.length > 0 ? (
          holidays.map((holiday, i) => (
            <div key={holiday.date + i} className="holiday-card">
              <span className=" holiday-date">
                {holiday.date}
              </span>
              <span  className={`holiday-day ${holiday.isSunday ? "sunday" : ""}`}>
                {new Date(holiday.date).toLocaleDateString("en-US", { weekday: "long" })}
              </span>
              <span className="holiday-name">{holiday.name}</span>
            </div>
          ))
        ) : (
          <p className="loading">Loading holidays...</p>
        )}
      </div>
    </div>
  );
};

export default Home;
