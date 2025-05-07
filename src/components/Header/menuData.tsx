import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "Tours",
    newTab: false,
    submenu: [
      {
        id: 21,
        title: "Tour List",
        path: "/about",
        newTab: false,
      },
      {
        id: 22,
        title: "International Destinations",
        path: "/about",
        newTab: false,
      },
      {
        id: 23,
        title: "Domestic Destinations",
        path: "/about",
        newTab: false,
      },
    ],
  },
  {
    id: 3,
    title: "Visa Expert",
   
    newTab: false,
    submenu:[
      {
        id:31,
        title:"Visa Assitance",
        path:'/',
        newTab:false
      }
    ]
  },
  {
    id: 4,
    title: "Cruises",
    newTab: false,
    submenu: [
      {
        id: 41,
        title: "To be Added",
        path: "/about",
        newTab: false,
      },
    ],
  },
  {
    id: 5,
    title: "Blogs",
    path: "/blog",
    newTab: false,
  },
  {
    id: 6,
    title: "Contact Us",
    path: "/contact",
    newTab: false,
  },
  {
    id: 7,
    title: " About Us",
    path: "/about",
    newTab: false,
  },
];

export default menuData;