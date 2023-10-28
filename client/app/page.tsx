"use client ";
import react, { FC } from "react";
import Heading from "./utils/Heading";
import Header from "./components/Header";

interface Props {}
// ?
const Page: FC<Props> = ({}) => {
  return (
    <>
      <Heading title="Home" description="" keywords="" />

      <Header />
    </>
  );
};
