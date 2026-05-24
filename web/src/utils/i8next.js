import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

i18next
    .use(initReactI18next)
    .init({
    fallbackLng: 'bg',
    debug: true,
    resources: {
        en: {
            translation: {
                SignIn: "Sign in",
                Login: "Login",
                Compare: "Compare",
                Create: "Create",
                Delete: "Delete",
                Edit: "Edit",
                addComparison: "Add comparison",
                byModelName: "By model name",
                brand: "Brand",
                releaseYear: "Release Year",
                close: "Close",
                createRobot: "Create Robot",
                editRobot: "Edit Robot",
                createConsumable: "Create Consumable",
                editConsumable: "Edit Consumable",
                specsAndFeatures: "Specs & Features",
                askQuestion: "Ask Question",
                enterYourQuestionHere: "Enter Your question here",
                title: "Title",
                description: "Description",
                price: "Price",
                noOffersAvailable: "No Offers Available",
                dustbinCapacity: "Dustbin Capacity",
                suctionPower: "Suction Power",
                consumables: "Consumables",
                vacuumRobots: "Vacuum Robots",
                noConsumablesAvailable: "No consumables available"

            }
        },
        bg: {
            translation: {
                SignIn: "Вход",
                Login: "Влез",
                Compare: "Сравни",
                Create: "Създай",
                Delete: "Изтрий",
                Edit: "Редактирай",
                addComparison: "Добави сравнение",
                byModelName: "По модел",
                brand: "Бранд",
                releaseYear: "Година на издаване",
                close: "Затвори",
                createRobot: "Създай робот",
                editRobot: "Редактирай робот",
                createConsumable: "Създай консуматив",
                editConsumable: "Редактирай консуматив",
                specsAndFeatures: "Спецификации и функции",
                askQuestion: "Задай въпрос",
                enterYourQuestionHere: "Въведете въпроса си тук",
                title: "Заглавие",
                description: "Описание",
                price: "Цена",
                noOffersAvailable: "Няма налични оферти",
                dustbinCapacity: "Капацитет на контейнера",
                suctionPower: "Всмукателна мощност",
                consumables: "Консумативи",
                vacuumRobots: "Вакуумни роботи",
                noConsumablesAvailable: "Няма налични консумативи"
            }
        }
    }
});