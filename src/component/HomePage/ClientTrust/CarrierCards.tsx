const carriers = [
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/DPD_logo_%282015%29.svg/2560px-DPD_logo_%282015%29.svg.png', alt: 'dpd' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/GLS_logo_2019.svg/2560px-GLS_logo_2019.svg.png', alt: 'gls' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/DHL_Logo.svg/2560px-DHL_Logo.svg.png', alt: 'dhl' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/UPS_Logo_Shield_2017.svg/2048px-UPS_Logo_Shield_2017.svg.png', alt: 'ups' },
  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Kuehne_Nagel_Logo.svg/2560px-Kuehne_Nagel_Logo.svg.png', alt: 'kn' },
];

export default function CarrierCards() {
  return (
   
        <div className="flex justify-center gap-6 flex-wrap position-absolute">
          {carriers.map((carrier, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-[20px] p-6 w-[80px] h-[80px] flex items-center justify-center transition-transform hover:scale-105"
            >
              <img
                src={carrier.src}
                alt={carrier.alt}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>

  );
}
