import React, { useState } from "react";

import CreateSurveyPage from "./pages/CreateSurveyPage";
import { CreateSurveyProviderMock } from "./component/CreateSurveyProvider";

function App() {
  const [generatedSurvey, setGeneratedSurvey] = useState(null);

  return (
    <CreateSurveyProviderMock>
     
      <CreateSurveyPage
        surveyData={generatedSurvey}
        setSurveyData={setGeneratedSurvey}
      />       
      
    </CreateSurveyProviderMock>
  );
}

export default App;
