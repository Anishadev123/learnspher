import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../style/InputForm.css";

const InputForm = () => {
  const location = useLocation();
  const idToken = location.state?.idToken || null;
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    goal: "",
    academicLevel: "",
    difficulty: "",
    language: "",
    learningStyle: "",
    keywords: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idToken) {
      console.error("Missing ID token. User may not be authenticated.");
      return;
    }

    const data = {
      ...formData,
      keywords: formData.keywords.split(",").map((kw) => kw.trim()),
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/study/create",
        data,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      console.log("Success:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
    }
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <h2>Create Study Plan</h2>
      {Object.keys(formData).map((key) => (
        <div className="form-group" key={key}>
          <label htmlFor={key}>{key}</label>
          <input
            type="text"
            id={key}
            name={key}
            value={formData[key]}
            onChange={handleChange}
            placeholder={`Enter ${key}`}
          />
        </div>
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

export default InputForm;