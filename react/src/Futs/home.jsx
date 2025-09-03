import './App.css'
import LiveGameCard from './componetes/card_jogos'

export function MenuCima() {

  return (
    <>
      <div className=" border-white border w-full h-[5%]">
          <h1 className=" text-white ">menur</h1>
      </div>
    </>
  )
}
export function BlocoMeio() {
    return (
    <>
      <div className=" border border-white h-[90%] w-full grid grid-cols-12 grid-rows-12 gap-1">
        <div  className=" text-white border col-start-1 col-span-2 ">esquerdo</div>
        <div  className=" text-white flex justify-center border col-start-3 col-span-7 row-span-12 gap-3 p-2">
        <LiveGameCard />
        <LiveGameCard />
        <LiveGameCard />



        </div>
        <div className=" text-white border col-start-10 col-span-4">direito</div>
      </div>
    </>
  )
}



export function Live() {

  return (
    <>
      <div className="w-full border border-white h-[5%]">
          <h1 className=" text-white ">menur baixo</h1>
      </div>
    </>
  )
}


