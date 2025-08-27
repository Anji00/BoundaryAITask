# Survey Generator 
AI-powered survey generator that transforms a user’s brief description into a fully structured questionnaire, covering diverse question types (multiple-choice, ratings, open-text, etc.) tailored to their needs.

## Setup Instructions
The following steps have to be performed once to setup the project.

1. **Install Dependencies**

* **Backend**
    Navigate to the project directory on the terminal:
  
      cd backend

    Activate your virtual environment:  

      python -m venv .venv
  
      On Mac:
      source .venv/bin/activate
  
      On Windows:  
      .venv\Scripts\activate  

      pip install -r requirements.txt

* **Frontend**
    Navigate to the project directory on the terminal:
  
      cd frontend
      npm install

2. **Initialize Database**
      
      Create a database:
   
        psql -U postgres  # Replace postgres with your admin user if different
        CREATE DATABASE surveydb;
        CREATE USER user WITH PASSWORD 'password';
        GRANT ALL PRIVILEGES ON DATABASE surveydb TO user;
        \q  # To exit

        where user is your username and password is your password

      Activate your virtual environment and cd to the backend directory and run:

        python3 createTables.py

      You should see:
   
        Creating tables in the database...
        Tables created successfully! 


2. **Environment Variables**
      Create a .env file inside the backend directory and add:
   
      DATABASE_URL=postgresql://user:password@localhost/surveydb
      OPENAI_API_KEY=sk-your-openai-api-key

    where user is your username, password is your password and sk-your-openai-api-key is your OpenAI API key


## Running the Application

* **Backend**
    Navigate to the project directory on the terminal:

      cd backend

    Activate your virtual environment and then run:

      uvicorn main:app --reload --port 8000

* **Frontend**
    Open another terminal window and navigate to the project directory on the terminal:

      cd frontend
      npm start

Open the browser at (if it doesn't automatically open): http://localhost:3000 

Now you are ready to play around with the survey generator by clicking on the 'Generate Survey' button on the top right corner of the window.

## Assumption
I have assumed that both NPS and rating type of questions are represented by the star icons.


## Design Decision 
I chose to use FastAPI over Flask due to its speed, built-in validation, and modern development features. 

* Unlike Flask, which requires additional libraries for validation and documentation, FastAPI uses Pydantic models to enforce data validation and type safety automatically, reducing boilerplate code. 
* It also provides interactive API documentation via Swagger UI which proved to be very useful while testing the endpoint.
* FastAPI supports asynchronous operations, making it highly performant and scalable for handling multiple concurrent requests efficiently.  

Libraries Used:
* Pydantic: It's models in FastAPI define the structure and types of data for validation and serialization, ensuring incoming requests match expected formats. They automatically handle type conversion and provide clear error messages for invalid input.
* SQLAlchemy: It was used to define Python classes that map directly to database tables, making it easier to do CRUD operations on survey data without writing raw SQL and interact with the PostgreSQL database, automatically creating tables and managing schema changes.

## Areas of focus 
I wanted to ensure consistency and uniformity across the features. I made the frontend elements that I added match to the exisiting elements so that they don't seem out of place. Moreover, I paid attention to the AI prompt to give very specific instructions and only generate the type of questions that are supported in the QuestionItem.jsx. I also added a 'Clear Survey' button to remove the existing survey being displayed and a generating survey progress indicator to show the progress of the API calls.  
