-------------------------------------------------------------------------------
-- Text Analysis
-------------------------------------------------------------------------------

CALL TA_ANALYZE ( 
  DOCUMENT_TEXT => 'ich will von der Güntzelstr. 10 in die Treskowallee 8', 
  LANGUAGE_CODE=>?, 
  MIME_TYPE =>?, 
  LANGUAGE_DETECTION =>'DE', 
  CONFIGURATION=>'EXTRACTION_CORE', 
  RETURN_PLAINTEXT=>0, 
  TA_ANNOTATIONS => ?, 
  PLAINTEXT => ? );

CALL TA_ANALYZE ( 
  DOCUMENT_TEXT => 'ich will von der Güntzelstr. 10 in die Treskowallee 8', 
  LANGUAGE_CODE=>?, 
  MIME_TYPE =>?, 
  LANGUAGE_DETECTION =>'DE', 
  CONFIGURATION=>'LINGANALYSIS_FULL', 
  RETURN_PLAINTEXT=>0, 
  TA_ANNOTATIONS => ?, 
  PLAINTEXT => ? );
  
CALL TA_ANALYZE ( 
  DOCUMENT_TEXT => 'The child kicks the ball', 
  LANGUAGE_CODE=>?, 
  MIME_TYPE =>?, 
  LANGUAGE_DETECTION =>'EN', 
  CONFIGURATION=>'GRAMMATICAL_ROLE_ANALYSIS', 
  RETURN_PLAINTEXT=>0, 
  TA_ANNOTATIONS => ?, 
  PLAINTEXT => ? );

    
CALL TA_ANALYZE ( 
  DOCUMENT_BINARY => '<!DOCTYPE html><html><body><h1>This is heading 1</h1><h2>TechABC Co. is one of the companies that has spent about $50 billion on acquisitions in the past decade.</h2></body></html>', 
  DOCUMENT_TEXT=>'', 
  LANGUAGE_CODE=>?, 
  MIME_TYPE =>?, 
  LANGUAGE_DETECTION =>'EN, DE, KR', 
  CONFIGURATION=>'EXTRACTION_CORE', 
  RETURN_PLAINTEXT=>1, 
  TA_ANNOTATIONS => ?, 
  PLAINTEXT => ? );
  
