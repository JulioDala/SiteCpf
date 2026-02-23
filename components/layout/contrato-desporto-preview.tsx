"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

export interface ContratoDesportoData {
    _id?: string;
    nomeEquipe: string;
    nomeResponsavel: string;
    email?: string;
    morada?: string;
    bi?: string;
    contato: string;
    diasSemana: string[];
    horarioInicio: string;
    horarioFim: string;
    tipoAtividade: { nome?: string; _id?: string };
    campo: { nome?: string; _id?: string };
    corIdentificacao?: string;
    valorPagamento: number;
    modalidadePagamento?: string;
    tipoPeriodo?: string;
    vendaIngresso?: string;
    valorIngresso?: number;
    valorCaucao?: number;
    dataInicio: Date | string;
    dataFim?: Date | string;
    status?: string;
}

interface ContratoDesportoPreviewProps {
    data: ContratoDesportoData;
    onBack: () => void;
    onDownload?: () => void;
    isDownloading?: boolean;
}

export function ContratoDesportoPreview({
    data: agendamento,
    onBack,
    onDownload,
    isDownloading = false
}: ContratoDesportoPreviewProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [formattedDateInicio, setFormattedDateInicio] = useState<string>("");

    useEffect(() => {
        if (agendamento?.dataInicio) {
            const dataInicio = typeof agendamento.dataInicio === "string"
                ? new Date(agendamento.dataInicio)
                : agendamento.dataInicio;
            if (!isNaN(dataInicio.getTime())) {
                setFormattedDateInicio(format(dataInicio, "dd/MM/yyyy", { locale: pt }));
            } else {
                setFormattedDateInicio("Data inválida");
            }
        }
    }, [agendamento]);

    const handlePrint = async () => {
        if (!printRef.current) return;

        try {
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const element = printRef.current;
            const pages = element.querySelectorAll(".contract-page");

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

    if (!agendamento) {
        return <div className="text-center py-8 text-gray-500">Nenhum agendamento selecionado</div>;
    }

    const formatCurrency = (value: number | undefined | null) => {
        if (value === undefined || value === null) return "0 AOA";
        return value.toLocaleString("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 });
    };

    return (
        <div className="space-y-6 max-h-[85vh] overflow-y-auto pr-2">
            <div className="flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm p-4 z-10 border-b border-gray-100 rounded-t-xl no-print">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Formulário
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
                    <Button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Printer className="h-4 w-4" />
                        Imprimir Contrato
                    </Button>
                </div>
            </div>

            <div
                ref={printRef}
                className="bg-white shadow-lg print:shadow-none overflow-x-auto rounded-xl border border-gray-100 p-4 mx-auto"
                style={{ width: "fit-content" }}
            >
                <style jsx>{`
          .contract-page {
            width: 21cm;
            min-height: 29.7cm;
            margin: 0 auto;
            background: white;
            padding: 2cm 2.5cm;
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            position: relative;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
            margin-bottom: 20px;
          }
          
          .contract-page * {
            color: black !important;
          }

          .header {
            display: flex;
            justify-content: center;
            margin-bottom: 40px;
          }

          .logo-container {
            width: 120px;
            height: 120px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }

          .title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin-bottom: 50px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-decoration: underline;
          }

          .company-info, .participant-info, .contract-intro, .considering, .clause, .clause-intro, .final-clause {
            margin-bottom: 25px;
            text-align: justify;
          }

          .clause-number {
            font-weight: bold;
            margin-right: 5px;
          }

          .highlight {
            font-weight: bold;
          }

          .date-location {
            margin-top: 60px;
            margin-bottom: 80px;
            text-align: left;
          }

          .signature-section {
            margin-top: 100px;
            display: flex;
            justify-content: space-between;
          }

          .signature-block {
            text-align: center;
            width: 250px;
          }

          .signature-line {
            border-bottom: 1.5px solid #000;
            margin-bottom: 10px;
            height: 40px;
          }

          .signature-label {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10pt;
          }

          @media print {
            .contract-page {
              box-shadow: none;
              margin-bottom: 0;
            }
          }
        `}</style>

                {/* PÁGINA 1 */}
                <div className="contract-page">
                    <div className="header">
                        <div className="logo-container">
                            <img
                                src="/images/logotipo-paz-flor.png"
                                alt="Logo Paz Flor"
                                className="logo-img"
                            />
                        </div>
                    </div>

                    <h1 className="title">CONTRATO DE RESERVA DA QUADRA POLIDESPORTIVA</h1>

                    <div className="company-info">
                        <span className="highlight">CENTRO CULTURAL PAZ FLOR</span>, com sede em Luanda, na Rua da Samba, Morro Bento nº 2, contribuinte Fiscal nº 5000276200.
                    </div>

                    <div className="contract-intro" style={{ textAlign: 'center', fontWeight: 'bold' }}>E</div>

                    <div className="participant-info">
                        <span className="highlight">{agendamento.nomeResponsavel || "Nome não informado"}</span>, portador do bilhete de identidade nº <span className="highlight">{agendamento.bi || "____________________"}</span>, Morada <span className="highlight">{agendamento.morada || "__________________________________________________"}</span>, telefone <span className="highlight">{agendamento.contato || "____________________"}</span>.
                    </div>

                    <div className="considering" style={{ fontWeight: 'bold' }}>Considerando que:</div>

                    <div className="clause">
                        a) O Centro Cultural Paz Flor é uma associação cultural desportiva e recreativa, sendo dono e legítimo possuidor de um espaço destinado à prática de actividades lúdicas e desportivas.
                    </div>

                    <div className="clause">
                        b) O <span className="highlight">{agendamento.nomeResponsavel || "Solicitante"}</span> solicita a utilização da quadra desportiva <span className="highlight">{agendamento.campo?.nome || "____________________"}</span>.
                    </div>

                    <div className="clause-intro">
                        Pelo presente instrumento, e na melhor forma de direito, as partes acima nomeadas têm entre si, certo e ajustado o presente contrato, que se regerá pelas seguintes cláusulas e condições que mutuamente aceitam, a saber:
                    </div>

                    <div className="clause">
                        <span className="clause-number">1.</span> O Centro Cultural Paz Flor-CCPF, cede o espaço supra para ser utilizado no dia <span className="highlight">{formattedDateInicio}</span>, no horário das <span className="highlight">{agendamento.horarioInicio || "___:___"}</span> às <span className="highlight">{agendamento.horarioFim || "___:___"}</span>, a fim de realizar a actividade desportiva denominada jogo de <span className="highlight">{agendamento.tipoAtividade?.nome || "____________________"}</span>.
                    </div>

                    <div className="clause">
                        <span className="clause-number">1.2.</span> Caso a reserva seja efectuada para realização de torneio por meio-dia (8h às 14h), deverá o Solicitante pagar AQA 300.000,00 (trezentos mil kwanzas). Caso seja realizado na íntegra, todo dia, deverá ser pago o valor de AQA 600.000,00 (seiscentos mil kwanzas).
                    </div>

                    <div className="clause">
                        <span className="clause-number">1.3.</span> Caso seja reservado com a finalidade de realizar um campeonato para o dia todo, deverá ser pago com venda de ingresso AQA 2.000.000,00 (dois milhões de kwanzas) e sem venda de ingresso será AQA 1.500.000,00 (um milhão e quinhentos mil kwanzas).
                    </div>

                    <div className="clause">
                        <span className="clause-number">2.</span> Importa referir que, para realização dos torneios ou campeonatos com venda de ingresso, precisará ser pago uma caução reembolsável, caso não ocorrer dano ao espaço, no valor de AQA 300.000,00 (trezentos mil kwanzas), se porventura advir danos deverá ser debitado no valor da caução para fazer face aos danos.
                    </div>

                    <div className="clause">
                        <span className="clause-number">2.1.</span> Pela utilização do espaço reservado para jogos normais, a outra parte poderá pagar à quantia de <span className="highlight">{formatCurrency(agendamento.valorPagamento)}</span> por hora e meia de jogo.
                    </div>
                </div>

                {/* PÁGINA 2 */}
                <div className="contract-page">
                    <div className="header" style={{ marginBottom: '20px' }}>
                        <div className="logo-container" style={{ width: '100px', height: '100px' }}>
                            <img
                                src="/images/logotipo-paz-flor.png"
                                alt="Logo Paz Flor"
                                className="logo-img"
                            />
                        </div>
                    </div>

                    <h1 className="title" style={{ fontSize: '14pt', marginBottom: '30px' }}>CONTRATO DE RESERVA DA QUADRA POLIDESPORTIVA</h1>

                    <div className="clause">
                        <span className="clause-number">2.2.</span> A reserva engloba somente a cessão de uso do espaço desportivo descrito no objecto deste contrato, ficando por conta de quem utilizar todas as demais despesas para a realização da referida actividade.
                    </div>

                    <div className="clause">
                        <span className="clause-number">2.3.</span> Para a utilização do espaço desportivo a pessoa que o reservou deverá estar no local na hora das actividades desportivas, e todos os presentes deverão respeitar as normas vigentes no CCPF.
                    </div>

                    <div className="clause">
                        <span className="clause-number">3.</span> O Solicitante, deverá fornecer ao CCPF, no momento da inscrição ou antes do início da actividade desportiva a relação nominal dos participantes.
                    </div>

                    <div className="clause">
                        <span className="clause-number">3.1.</span> O Centro Cultural Paz Flor, não se responsabilizará por quaisquer danos ocorridos a qualquer participante que esteja utilizando o espaço.
                    </div>

                    <div className="clause">
                        <span className="clause-number">3.3.</span> O Solicitante do espaço desportivo se responsabilizará por todos os danos causados pelos participantes do evento nas instalações do CCPF, móveis e do próprio imóvel locado, que deverão ser devidamente indemnizados para a recomposição do mesmo, de forma a manter as condições e características originais.
                    </div>

                    <div className="clause">
                        <span className="clause-number">4.</span> O solicitante declara ter lido as normas de uso das quadras desportivas do CCPF, e estar de acordo preceitos descritos.
                    </div>

                    <div className="clause">
                        <span className="clause-number">4.1.</span> É proibida a entrada e vendas de consumíveis tais como comida e bebidas nas instalações do CCPF.
                    </div>

                    <div className="final-clause">
                        E, por estarem de comum acordo, assinam o presente contrato em 02 (duas) vias de igual forma e teor.
                    </div>

                    <div className="date-location">
                        Luanda, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: pt })}.
                    </div>

                    <div className="signature-section">
                        <div className="signature-block">
                            <div className="signature-line"></div>
                            <p className="signature-label">Solicitante</p>
                            <p className="text-xs">({agendamento.nomeResponsavel})</p>
                        </div>
                        <div className="signature-block">
                            <div className="signature-line"></div>
                            <p className="signature-label">CCPF</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
