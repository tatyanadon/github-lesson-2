from openpyxl import Workbook, load_workbook
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

STORAGE_FILE_NAME = 'data.xlsx'

class Person(BaseModel):
    firstName: str
    lastName: str 
    age: int
   
#создаем экземпляр класса FastAPI который является веб сервером   
app = FastAPI() 

wb = None
try:
    wb = load_workbook(filename=STORAGE_FILE_NAME)
except:
  wb = Workbook()
  wb.save(filename=STORAGE_FILE_NAME)

persons_sheet = None
try:
    persons_sheet = wb.get_sheet_by_name("Person")
except:
    persons_sheet = wb.create_sheet("Person")
    wb.save(filename=STORAGE_FILE_NAME)

# #откр эксель фай и создает экз КЛАССА workbook
# wb = load_workbook(filename='data.xlsx')
# # sheet_ranges = wb.cr("Person")
# # sheet_ranges = wb.get_sheet_by_name("Person")
# persons_sheet = wb.active
# # print(sheet_ranges['D18'].value)

# allow cors requests
origins = [
    "*",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/user")
def create_user(user: Person):
    ws = persons_sheet
    ws.append([user.firstName, user.lastName, user.age])
    wb.save(filename=STORAGE_FILE_NAME)

@app.get("/users")
def get_user():
    persons = []
    for row in persons_sheet.iter_rows():
        p = Person(firstName=row[0].value, lastName=row[1].value, age=row[2].value)
        persons.append(p)
    return persons
