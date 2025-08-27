import React, { useState } from "react";
import DashboardLayout from "../component/DashboardLayout";
import CreateSurvey from "../component/CreateSurvey";
import CreateSurveySidebar from "../component/CreateSurveySidebar";
import Header from "../component/Header";
import { CreateSurveyProviderMock, useCreateSurveyProvider } from "../component/CreateSurveyProvider";


const CreateSurveyContent = ({ 
  loading, 
  generatedSurveyData, 
  isGenerating, 
  handleGenerateSurvey,
  setGeneratedSurveyData,  
  surveySeriesId 
}) => {
  const { clearSurvey } = useCreateSurveyProvider();

  const handleClearSurvey = () => {
    clearSurvey(); // Clear the form fields
    setGeneratedSurveyData(null); // Clear the generated data state
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full h-full overflow-hidden mt-2">
        <div className="lg:min-h-[90px]">
          <Header>
           
            <div className="flex items-center justify-between w-full px-4">
            <h2 className="text-[26px] font-switzerMedium font-bold text-primary m">
              Create a New Survey
            </h2>

            <div className="flex justify-end gap-3 px-4 pb-3 mt-3">
            
            {/* Survey Buttons */}
            <button
              onClick={handleGenerateSurvey}
              disabled={loading}
              whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(108, 93, 211, 0.3)" }}
              whileTap={{ scale: 0.95 }}

              className="bg-[#6851a7] flex gap-2 mr-6 items-center text-white text-base py-3 px-4 rounded-full shadow-sm transition-all duration-300">
              {loading ? "Generating..." : "Generate Survey"}
            </button>

                
            {generatedSurveyData && (
              <button
                onClick={handleClearSurvey}
                disabled={loading}
                whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(102, 102, 103, 0.3)" }}
                whileTap={{ scale: 0.95 }}

                className="bg-gray-500 flex gap-2 mr-6 items-center text-white  text-base py-3 px-4 rounded-full shadow-sm transition-all duration-300">
            
                Clear Survey
              </button>
            )}
          </div>
          </div>
          
          </Header>

          

          {/* Loading Indicator */}
          {isGenerating && (
            <div className="px-4 pb-2 ml-2 mb-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-700 text-sm">Generating survey content...</span>
                </div>
              </div>
            </div>
          )}

          {/* Success Indicator */}
          {generatedSurveyData && !isGenerating && (
            <div className="px-4 pb-2 ml-2 mb-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 text-sm">Survey content generated!</span>
                </div>
              </div>
            </div>
          )}
        </div>
   
        
        <div className="flex grow w-full overflow-hidden h-full">
          <div className="grow p-3 sm:p-2 w-full overflow-auto h-[calc(100vh-164px)] sm:h-[calc(100vh-192px)] md:h-[calc(100vh-192px)] lg:h-[calc(100vh-148px)] xl:h-full scrollbar-style">
            <div className="block lg:hidden">
              <CreateSurveySidebar surveySeriesId={surveySeriesId} />
            </div>
            <CreateSurvey />
          </div>
          <div className="hidden lg:block min-w-[280px] p-3 max-w-[280px] overflow-auto scrollbar-style h-[calc(100vh-89px)]">
            <CreateSurveySidebar surveySeriesId={surveySeriesId} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const CreateSurveyPage = ({ surveySeriesId = "defaultId" }) => {
  const [loading, setLoading] = useState(false);
  const [generatedSurveyData, setGeneratedSurveyData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSurvey = async () => {
    const description = prompt("Enter survey description:");
    if (!description) return;

    setLoading(true);
    setIsGenerating(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/api/surveys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      }
    
    );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate survey.");
      }

      const data = await response.json();

      // Set the generated survey data to autofill the form
      setGeneratedSurveyData(data.survey);
      
      alert("Survey generated successfully! The form has been populated with the generated content.");
      
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);

    } finally {
      setLoading(false);
      setIsGenerating(false);
    }
  };

  return (
    <CreateSurveyProviderMock generatedSurveyData={generatedSurveyData}>
      <CreateSurveyContent 
        loading={loading}
        generatedSurveyData={generatedSurveyData}
        isGenerating={isGenerating}
        handleGenerateSurvey={handleGenerateSurvey}
        setGeneratedSurveyData={setGeneratedSurveyData} 
        surveySeriesId={surveySeriesId}
      />
    </CreateSurveyProviderMock>
  );
};

export default CreateSurveyPage;