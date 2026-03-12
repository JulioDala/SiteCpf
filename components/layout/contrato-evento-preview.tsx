"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useEspacosStore } from "@/storage/espaco-store";
import { useTiposEventos } from "@/storage/tipo-evento-store";

export interface DoceEventoData {
    cliente?: any | null;
    clienteNome: string;
    clienteTelefone: string;
    clienteWhatsapp: string;
    clienteEmail: string;
    clienteBiPassaporte?: string;
    clienteMorada?: string;
    clienteTipo?: string;
    tipoEvento: string;
    dataEvento: string;
    espacoId: string;
    numeroConvidados: string;
    horaInicio: string;
    horaTermino: string;
    decoracaoInterna: boolean;
    cateringInterno: boolean;
    djInterno: boolean;
    decoracaoExterna: boolean;
    cateringExterno: boolean;
    djExterno: boolean;
    contactoDecoradora: string;
    contactoCatering: string;
    contactoDJ: string;
    outrasInformacoes: string;
    assinaturaFuncionario?: string;
    localevento?: string;
    tipoEventoId?: string;
};

interface ContratoEventoPreviewProps {
    data: DoceEventoData;
    onBack: () => void;
    onDownload?: () => void;
    isDownloading?: boolean;
}

export function ContratoEventoPreview({
    data,
    onBack,
    onDownload,
    isDownloading = false
}: ContratoEventoPreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const espacos = useEspacosStore(s => s.espacos);
    const espacosLoading = useEspacosStore(s => s.isLoading);
    const espacosError = useEspacosStore(s => s.error);
    const fetchEspacos = useEspacosStore(s => s.fetchEspacos);

    const tiposEventos = useTiposEventos(s => s.tiposEventos);
    const fetchTiposEventos = useTiposEventos(s => s.fetchTiposEventos);

    const espaco = espacos.find((e) => e._id === data.espacoId);

    useEffect(() => {
        if (espacos.length === 0) fetchEspacos();
        if (tiposEventos.length === 0) fetchTiposEventos();
    }, [fetchEspacos, fetchTiposEventos, espacos.length, tiposEventos.length]);

    const handlePrint = async () => {
        if (!printRef.current) return;

        try {
            // Importa as bibliotecas dinamicamente
            // @ts-ignore
            const html2canvas = (await import("html2canvas")).default;
            // @ts-ignore
            const jsPDF = (await import("jspdf")).default;

            const element = printRef.current;
            const pages = element.querySelectorAll(".page");

            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;

                const canvas = await html2canvas(page, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                });

                const imgData = canvas.toDataURL("image/png");

                if (i > 0) {
                    pdf.addPage();
                }

                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            }

            // Abre o PDF para impressão
            const pdfBlob = pdf.output("blob");
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const printWindow = window.open(pdfUrl);

            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.print();
                };
            }
        } catch (error) {
            console.error("Erro ao imprimir:", error);
            alert("Erro ao gerar impressão. Tente novamente.");
        }
    };

    const formatDate = (date: Date | string) => {
        if (!date) return "";
        const parsedDate = typeof date === "string" ? new Date(date) : date;
        return format(parsedDate, "dd 'de' MMMM 'de' yyyy", { locale: pt });
    };

    const checkCapacidadeExcedida = () => {
        const capacidade = espaco?.capacidade || 0;
        const numeroConvidados = Number(data.numeroConvidados) || 0;
        return numeroConvidados > capacidade
            ? `Aviso: O número de convidados (${numeroConvidados}) excede a capacidade máxima do espaço (${capacidade} pessoas).`
            : "";
    };

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = format(currentDate, "MMMM", { locale: pt });
    const currentYear = currentDate.getFullYear();

    return (
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
            <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm p-4 z-10 border-b border-gray-100 rounded-t-xl no-print">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Edição
                </Button>
                <div className="flex gap-2">
                    {onDownload && (
                        <Button
                            variant="outline"
                            onClick={onDownload}
                            className="flex items-center gap-2 bg-transparent"
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Baixar PDF
                        </Button>
                    )}
                    <Button onClick={handlePrint} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                        <Printer className="h-4 w-4" />
                        Imprimir Contrato
                    </Button>
                </div>
            </div>

            <div
                ref={printRef}
                data-pdf-content="contrato"
                className="bg-white shadow-lg print:shadow-none overflow-x-auto rounded-xl border border-gray-100 p-4"
            >
                <style jsx>{`
          .page {
            width: 21cm;
            min-height: 29.7cm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
            position: relative;
            padding: 2cm 2cm 3cm 2cm;
            page-break-after: always;
            font-family: Arial, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
          }
          .logo-container {
            width: 120px;
            height: 120px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
          }
          .logo-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .contract-title {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin: 30px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            font-size: 12px;
          }
          .field-group {
            margin-bottom: 15px;
          }
          .field-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }
          .field-label {
            min-width: 100px;
            font-weight: bold;
            margin-right: 10px;
          }
          .contract-text {
            text-align: justify;
            line-height: 1.5;
            margin-bottom: 20px;
          }
          .contract-text p {
            margin-bottom: 12px;
          }
          .clause {
            margin-bottom: 15px;
            text-align: justify;
          }
          .clause-number {
            font-weight: bold;
            display: inline;
          }
          .signatures {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-block {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            height: 40px;
            margin-bottom: 5px;
          }
          .signature-label {
            font-size: 10px;
            font-weight: bold;
          }
          .checkbox {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 6px;
            font-size: 12px;
            font-weight: 700;
            color: #10b981;
            background: transparent;
            border: 1px solid #10b981;
            border-radius: 4px;
            box-sizing: border-box;
            vertical-align: middle;
            min-width: 18px;
            min-height: 18px;
          }
          .checkbox.selected {
            background-color: #10b981;
            color: white;
          }
          @media print {
            .checkbox {
              font-size: 11px !important;
              padding: 0 5px !important;
            }
          }
          .space-option {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 11px;
          }
          .warning {
            color: #dc2626;
            font-weight: bold;
            margin-top: 10px;
            font-size: 10px;
          }
          .section-title-main {
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 12px;
          }
          .clause-title {
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
            font-size: 12px;
          }
          .highlight {
            font-weight: bold;
          }
          .date-location {
            margin: 30px 0;
          }
          .loading-container {
            display: flex;
            align-items: center;
            gap: 8px;
            font-style: italic;
          }
        `}</style>

                {/* Page 1 */}
                <div className="page">
                    <div className="header">
                        <div className="logo-container">
                            <img
                                src="/images/logotipo-paz-flor.png"
                                alt="Centro Cultural Paz Flor"
                                className="logo-img"
                            />
                        </div>
                    </div>
                    <div className="contract-title">CONTRATO DE LOCAÇÃO DE ESPAÇO PARA EVENTOS</div>
                    <div className="section">
                        <div className="section-title">Entre:</div>
                        <div className="contract-text">
                            <p>
                                <span className="highlight">CCPF</span> Centro Cultural Paz Flor, com sede no Morro Bento, Rua da Samba
                                nº02, NIF 5000276200, representada neste ato pelo Sr. Celso Samukonga Rosa Tavares, na qualidade de
                                Presidente da Direção Geral, adiante designado por "<span className="highlight">CCPF</span>".
                            </p>
                        </div>
                        <div className="field-group">
                            <div className="field-row">
                                <span className="field-label">E Sr(a)</span>{" "}
                                <strong>{(data?.clienteNome || "").toUpperCase()}</strong>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Portador do B.I nº</span>
                                <div className="">{data?.clienteBiPassaporte || ""}</div>
                            </div>
                            <div className="field-row">
                                <span className="field-label">Residente em</span>
                                <div className="">{data?.clienteMorada || ""}</div>
                            </div>
                            <div className="field-row">
                                <span>
                                    Adiante designado(a) por "<span className="highlight">{data.clienteTipo?.toUpperCase() || "CLIENTE"}</span>".
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="contract-text">
                        <p>
                            As partes identificadas acima descritas têm, entre si, justo e acertado o presente Contrato de Locação
                            de Espaço Para Evento, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e
                            termo de pagamento.
                        </p>
                    </div>
                    <div className="section">
                        <div className="section-title-main">DO EVENTO</div>
                        <div className="clause-title">Cláusula 1ª</div>
                        <div className="clause">
                            <span className="clause-number">1.</span> O espaço pretendido para locação será:
                            <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                                {espacosLoading ? (
                                    <div className="loading-container">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Carregando espaços...</span>
                                    </div>
                                ) : espacosError ? (
                                    <div className="warning">Erro ao carregar espaços: {espacosError}</div>
                                ) : (
                                    <>
                                        {espacos.map((e) => {
                                            const isSelected = data.espacoId === e._id;
                                            return (
                                                <div key={e._id} className="space-option">
                                                    <div className={`checkbox ${isSelected ? "selected" : ""}`}>
                                                        {isSelected ? "✓" : ""}
                                                    </div>
                                                    <span>
                                                        {e.nome} (capacidade máxima para {e.capacidade} pessoas)
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {checkCapacidadeExcedida() && (
                                            <div className="warning">{checkCapacidadeExcedida()}</div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="clause">
                        <span className="clause-number">2.</span> O espaço locado tem capacidade máxima conforme item acima indicado, número este que não deverá
                        em hipótese alguma ser ultrapassado, além de possuir como horário limite para ocorrência do evento
                        até às 5h:30 por imperativo legal constante no artigo 38.º DP n.º 111/11, Regula Actividade de
                        Espetáculos e Divertimentos Públicos, sob pena de coima prescrita na cláusula 39.º do diploma supra.
                    </div>
                    <div className="clause">
                        <span className="clause-number">3.</span> O espaço alocado somente poderá ser utilizado para finalidade de realização do evento acordado,
                        sendo terminantemente vedada sua utilização para outro fim. O desvio de finalidade ou a inobservância
                        do acordo sujeitam o o locatário à multa determinada na cláusula acima mencionada desse instrumento
                        e à rescisão automática do contrato, a critério do CCPF, mediante, inclusive ressarcimento de eventuais
                        perdas e danos.
                    </div>
                </div>

                {/* Page 2 */}
                <div className="page">
                    <div className="header">
                        <div className="logo-container">
                            <img
                                src="/images/logotipo-paz-flor.png"
                                alt="Centro Cultural Paz Flor"
                                className="logo-img"
                            />
                        </div>
                    </div>
                    <div className="section">
                        <div className="section-title-main">DO OBJETO DO CONTRATO</div>
                        <div className="clause-title">Cláusula 2ª</div>
                    </div>
                    <div className="clause">
                        <span className="clause-number">1.</span> É objeto do presente contrato a Locação de Espaço assinalado no item acima cláusula 1ª, para evento
                        em que realizar-se-à na data de {" "}
                        <span className="highlight">{formatDate(data.dataEvento)}</span> às <span className="highlight">{data.horaInicio}</span> horas.
                    </div>
                    <div className="section">
                        <div className="section-title-main">OBRIGAÇÕES DO LOCATÁRIO</div>
                        <div className="clause-title">Cláusula 3ª</div>
                    </div>
                    <div className="clause">
                        <span className="clause-number">1.</span> Serão de inteira responsabilidade do Locatário quaisquer danos causados
                        aos bens móveis e imóveis do CCPF.
                    </div>
                    <div className="clause">
                        <span className="clause-number">2.</span> No dia da assinatura do contrato, deverá ser assinado um termo de vistoria à qual estará anexa uma
                        relação com todos os itens constantes do espaço e que, juntamente com um funcionário do CCPF será
                        feita a vistoria inicial no local para verificação do estado e funcionamento de todo espaço,
                        responsabilizando-se integralmente por quaisquer danos causados.
                    </div>
                    <div className="clause">
                        <span className="clause-number">3.</span> A vistoria deverá ocorrer um dia antes da montagem da decoração, isto é no encontro pré-evento.
                    </div>
                    <div className="clause">
                        <span className="clause-number">4.</span> Não será permitido poluição sonora, de formas a evitar o risco de perda auditiva dos clientes e ruídos
                        urbanos que pertubem o sossego da vizinhança, por conseguinte os níveis de decibéis devem ser
                        moderados (55 decibéis) em conformidade com os níveis máximos recomendados.
                    </div>
                    <div className="clause">
                        <span className="clause-number">5.</span> É proibido a colocação de ítens publicitários (lonas, vinis, cartazes e bandeiras) ou similares fora do
                        space reservado para o efeito sem aviso prévio formal, bem como a realização de eventos de cariz
                        político-partidário e cerimônias fúnebres.
                    </div>
                </div>

                {/* Page 3 */}
                <div className="page">
                    <div className="header">
                        <div className="logo-container">
                            <img
                                src="/images/logotipo-paz-flor.png"
                                alt="Centro Cultural Paz Flor"
                                className="logo-img"
                            />
                        </div>
                    </div>
                    <div className="section">
                        <div className="section-title-main">DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO</div>
                        <div className="clause-title">Cláusula 6ª</div>
                    </div>
                    <div className="clause">
                        <span className="clause-number">1.</span> O Locatário que pretende realizar um evento, deverá reserva-lo e efectuar o pagamento do sinal,
                        correspondente a 50% (cinquenta por cento), do valor global do contrato, no prazo, não superior a 7
                        (sete) dias, contados a partir da data da emissão da factura.
                    </div>
                    <div className="clause">
                        <span className="clause-number">2.</span> Caso o Locatário não pretenda aderir ao pacote "chave na mão", deverá efectuar o pagamento de AKZ
                        625.000,00 por cada serviço de decoração/buffet e 75.000,00 para DJ.
                    </div>
                    <div className="clause">
                        <span className="clause-number">3.</span> O Locatário deverá efectuar o pagamento do valor remanescente, até 30 dias antes da data
                        indicada para o referido evento.
                    </div>
                    <div className="clause">
                        <span className="clause-number">4.</span> O Locatário deverá efectuar o pagamento, 5 dias antes do evento, em numerário de AKZ
                        600.000,00 na tesouraria do CCPF, a título de caução para fazer face a eventuais danos.
                    </div>
                    <div className="section">
                        <div className="section-title-main">DA RESCISÃO E FORO</div>
                    </div>
                    <div className="clause">
                        <span className="clause-number">1.</span> O presente contrato poderá ser rescindido unilateralmente por qualquer uma das partes mediante aviso prévio.
                    </div>
                    <div className="clause">
                        <span className="clause-number">2.</span> Para dirimir quaisquer controvérsias, as partes elegem o foro da comarca de Luanda.
                    </div>
                    <div className="date-location">
                        <p>
                            Luanda, {currentDay} de {currentMonth} de {currentYear}.
                        </p>
                    </div>
                    <div className="signatures">
                        <div className="signature-block">
                            <div className="signature-line"></div>
                            <div className="signature-label">CCPF - REPRESENTANTE</div>
                        </div>
                        <div className="signature-block">
                            <div className="signature-line"></div>
                            <div className="signature-label">{data?.clienteNome || "O LOCATÁRIO"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
